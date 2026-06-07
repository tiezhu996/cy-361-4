import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { overviewData } from "./overview.data";
import { Equipment } from "../entities/equipment.entity";
import { Reservation, ReservationStatus } from "../entities/reservation.entity";
import { Violation } from "../entities/violation.entity";
import { User } from "../entities/user.entity";

@Injectable()
export class OverviewService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Violation)
    private violationRepository: Repository<Violation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getOverview() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [equipmentCount, userCount] = await Promise.all([
      this.equipmentRepository.count(),
      this.userRepository.count(),
    ]);

    const todayReservations = await this.reservationRepository.find({
      where: {
        startTime: Between(startOfDay, endOfDay),
      },
    });

    const todayCompleted = todayReservations.filter(r => r.status === ReservationStatus.COMPLETED).length;
    const todayPending = todayReservations.filter(r => r.status === ReservationStatus.PENDING).length;
    const todayCheckedIn = todayReservations.filter(r => r.status === ReservationStatus.CHECKED_IN).length;
    const totalViolations = await this.violationRepository.count();

    const pendingReservations = await this.reservationRepository.find({
      where: { status: ReservationStatus.PENDING },
      relations: ["equipment", "user"],
      order: { startTime: "ASC" },
      take: 5,
    });

    const recentViolations = await this.violationRepository.find({
      relations: ["reservation", "reservation.equipment", "user"],
      order: { createdAt: "DESC" },
      take: 5,
    });

    return {
      ...overviewData,
      stats: {
        equipmentCount,
        userCount,
        todayReservations: todayReservations.length,
        todayCompleted,
        todayPending,
        todayCheckedIn,
        totalViolations,
      },
      kpis: [
        {
          label: "设备总数",
          value: equipmentCount.toString(),
          trend: "在用设备",
          tone: "primary",
        },
        {
          label: "今日预约",
          value: todayReservations.length.toString(),
          trend: `完成 ${todayCompleted} / 待签到 ${todayPending}`,
          tone: "warm",
        },
        {
          label: "使用中",
          value: todayCheckedIn.toString(),
          trend: "当前签到使用",
          tone: "cool",
        },
        {
          label: "累计违约",
          value: totalViolations.toString(),
          trend: "超时未签到记录",
          tone: "danger",
        },
      ],
      upcomingReservations: pendingReservations.map(r => ({
        id: r.id,
        equipmentName: r.equipment?.name,
        userName: r.user?.name,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
      })),
      recentViolations: recentViolations.map(v => ({
        id: v.id,
        userName: v.user?.name,
        equipmentName: v.reservation?.equipment?.name,
        type: v.type,
        description: v.description,
        createdAt: v.createdAt,
      })),
    };
  }

  getHealth() {
    return { status: "ok" };
  }
}
