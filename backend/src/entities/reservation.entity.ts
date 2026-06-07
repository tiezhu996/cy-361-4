import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Equipment } from "./equipment.entity";
import { User } from "./user.entity";

export enum ReservationStatus {
  PENDING = "pending",
  CHECKED_IN = "checked_in",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  VIOLATED = "violated",
}

@Entity("reservations")
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", name: "equipment_id" })
  equipmentId: number;

  @Column({ type: "int", name: "user_id" })
  userId: number;

  @Column({ type: "datetime", name: "start_time" })
  startTime: Date;

  @Column({ type: "datetime", name: "end_time" })
  endTime: Date;

  @Column({ type: "datetime", name: "checkin_time", nullable: true })
  checkinTime: Date;

  @Column({ type: "datetime", name: "checkout_time", nullable: true })
  checkoutTime: Date;

  @Column({ type: "int", name: "actual_duration_minutes", nullable: true })
  actualDurationMinutes: number;

  @Column({
    type: "varchar",
    length: 20,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ type: "varchar", length: 64, name: "qr_code_token", unique: true, nullable: true })
  qrCodeToken: string;

  @Column({ type: "text", nullable: true })
  purpose: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => Equipment, (equipment) => equipment.reservations)
  @JoinColumn({ name: "equipment_id" })
  equipment: Equipment;

  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: "user_id" })
  user: User;
}
