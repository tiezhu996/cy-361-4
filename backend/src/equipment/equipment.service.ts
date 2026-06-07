import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, In } from "typeorm";
import { Equipment } from "../entities/equipment.entity";
import { Reservation, ReservationStatus } from "../entities/reservation.entity";

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {}

  async findAll(category?: string): Promise<Equipment[]> {
    const where: any = {};
    if (category) {
      where.category = category;
    }
    return this.equipmentRepository.find({ where });
  }

  async findOne(id: number): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({ where: { id } });
    if (!equipment) {
      throw new NotFoundException(`设备 #${id} 不存在`);
    }
    return equipment;
  }

  async getAvailableSlots(equipmentId: number, date: string): Promise<Array<{ start: string; end: string; available: boolean }>> {
    const equipment = await this.findOne(equipmentId);
    const startDate = new Date(`${date}T00:00:00`);
    const endDate = new Date(`${date}T23:59:59`);

    const reservations = await this.reservationRepository.find({
      where: {
        equipmentId,
        startTime: Between(startDate, endDate),
        status: In([ReservationStatus.PENDING, ReservationStatus.CHECKED_IN]),
      },
    });

    const slots: Array<{ start: string; end: string; available: boolean }> = [];
    const slotDuration = equipment.minReserveMinutes;
    const operatingStart = 8;
    const operatingEnd = 22;

    for (let hour = operatingStart; hour < operatingEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(`${date}T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

        const isOverlapping = reservations.some((r) => {
          const rStart = new Date(r.startTime);
          const rEnd = new Date(r.endTime);
          return slotStart < rEnd && slotEnd > rStart;
        });

        slots.push({
          start: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
          end: `${slotEnd.getHours().toString().padStart(2, "0")}:${slotEnd.getMinutes().toString().padStart(2, "0")}`,
          available: !isOverlapping,
        });
      }
    }

    return slots;
  }

  async getCategories(): Promise<string[]> {
    const result = await this.equipmentRepository
      .createQueryBuilder("equipment")
      .select("DISTINCT equipment.category", "category")
      .where("equipment.category IS NOT NULL")
      .getRawMany();
    return result.map((r) => r.category);
  }
}
