import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThan, In } from "typeorm";
import { Reservation, ReservationStatus } from "../entities/reservation.entity";
import { Equipment } from "../entities/equipment.entity";
import { User } from "../entities/user.entity";
import { Violation, ViolationType } from "../entities/violation.entity";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import * as crypto from "crypto";

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Violation)
    private violationRepository: Repository<Violation>,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const equipment = await this.equipmentRepository.findOne({ where: { id: dto.equipmentId } });
    if (!equipment) {
      throw new NotFoundException(`设备 #${dto.equipmentId} 不存在`);
    }

    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`用户 #${dto.userId} 不存在`);
    }

    if (equipment.requiresCertification && !user.isCertified) {
      throw new ForbiddenException("您尚未取得该设备的使用资质，请先完成培训认证");
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException("预约结束时间必须晚于开始时间");
    }

    if (startTime < new Date()) {
      throw new BadRequestException("不能预约过去的时间");
    }

    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationMinutes < equipment.minReserveMinutes) {
      throw new BadRequestException(`预约时长不能少于 ${equipment.minReserveMinutes} 分钟`);
    }
    if (durationMinutes > equipment.maxReserveHours * 60) {
      throw new BadRequestException(`预约时长不能超过 ${equipment.maxReserveHours} 小时`);
    }

    const hasConflict = await this.checkConflict(dto.equipmentId, startTime, endTime);
    if (hasConflict) {
      throw new BadRequestException("该时段已被预约，请选择其他时段");
    }

    const qrCodeToken = crypto.randomBytes(32).toString("hex");

    const reservation = this.reservationRepository.create({
      equipmentId: dto.equipmentId,
      userId: dto.userId,
      startTime,
      endTime,
      purpose: dto.purpose,
      status: ReservationStatus.PENDING,
      qrCodeToken,
    });

    return this.reservationRepository.save(reservation);
  }

  async findAll(userId?: number, status?: string, equipmentId?: number): Promise<Reservation[]> {
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (equipmentId) where.equipmentId = equipmentId;

    return this.reservationRepository.find({
      where,
      relations: ["equipment", "user"],
      order: { startTime: "DESC" },
    });
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ["equipment", "user"],
    });
    if (!reservation) {
      throw new NotFoundException(`预约 #${id} 不存在`);
    }
    return reservation;
  }

  async findByQrToken(qrCodeToken: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { qrCodeToken },
      relations: ["equipment", "user"],
    });
    if (!reservation) {
      throw new NotFoundException("二维码无效");
    }
    return reservation;
  }

  async checkin(qrCodeToken: string): Promise<Reservation> {
    const reservation = await this.findByQrToken(qrCodeToken);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(`当前预约状态为 ${reservation.status}，无法签到`);
    }

    const now = new Date();
    const startTime = new Date(reservation.startTime);
    const fifteenMinutesAfter = new Date(startTime.getTime() + 15 * 60 * 1000);

    if (now > fifteenMinutesAfter) {
      throw new BadRequestException("已超过预约开始时间15分钟，预约已自动取消");
    }

    reservation.checkinTime = now;
    reservation.status = ReservationStatus.CHECKED_IN;

    return this.reservationRepository.save(reservation);
  }

  async checkout(qrCodeToken: string): Promise<Reservation> {
    const reservation = await this.findByQrToken(qrCodeToken);

    if (reservation.status !== ReservationStatus.CHECKED_IN) {
      throw new BadRequestException(`当前预约状态为 ${reservation.status}，无法签退`);
    }

    const now = new Date();
    reservation.checkoutTime = now;

    if (reservation.checkinTime) {
      const actualDuration = Math.round((now.getTime() - new Date(reservation.checkinTime).getTime()) / (1000 * 60));
      reservation.actualDurationMinutes = actualDuration;
    }

    reservation.status = ReservationStatus.COMPLETED;

    return this.reservationRepository.save(reservation);
  }

  async cancel(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(`当前预约状态为 ${reservation.status}，无法取消`);
    }

    reservation.status = ReservationStatus.CANCELLED;
    return this.reservationRepository.save(reservation);
  }

  async checkConflict(equipmentId: number, startTime: Date, endTime: Date, excludeId?: number): Promise<boolean> {
    const where: any = {
      equipmentId,
      status: In([ReservationStatus.PENDING, ReservationStatus.CHECKED_IN]),
    };

    if (excludeId) {
      where.id = { $ne: excludeId } as any;
    }

    const reservations = await this.reservationRepository.find({ where });

    return reservations.some((r) => {
      const rStart = new Date(r.startTime);
      const rEnd = new Date(r.endTime);
      return startTime < rEnd && endTime > rStart;
    });
  }

  async processViolations(): Promise<number> {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const pendingReservations = await this.reservationRepository.find({
      where: {
        status: ReservationStatus.PENDING,
        startTime: LessThan(fifteenMinutesAgo),
      },
      relations: ["user"],
    });

    let processedCount = 0;

    for (const reservation of pendingReservations) {
      reservation.status = ReservationStatus.VIOLATED;
      await this.reservationRepository.save(reservation);

      const violation = this.violationRepository.create({
        userId: reservation.userId,
        reservationId: reservation.id,
        type: ViolationType.NO_SHOW,
        description: `预约设备「${reservation.equipment?.name || reservation.equipmentId}」超时15分钟未签到，已自动释放`,
      });
      await this.violationRepository.save(violation);

      processedCount++;
    }

    return processedCount;
  }

  async getViolationCount(userId?: number): Promise<number> {
    const where: any = {};
    if (userId) where.userId = userId;
    return this.violationRepository.count({ where });
  }

  async getViolations(userId?: number): Promise<Violation[]> {
    const where: any = {};
    if (userId) where.userId = userId;
    return this.violationRepository.find({
      where,
      relations: ["reservation", "reservation.equipment"],
      order: { createdAt: "DESC" },
    });
  }

  async getTodayReservations(): Promise<Reservation[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.reservationRepository.find({
      where: {
        startTime: Between(startOfDay, endOfDay),
      },
      relations: ["equipment", "user"],
      order: { startTime: "ASC" },
    });
  }
}
