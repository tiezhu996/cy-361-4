import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Reservation } from "./reservation.entity";

export enum ViolationType {
  LATE_CHECKIN = "late_checkin",
  NO_SHOW = "no_show",
  OVERTIME = "overtime",
}

@Entity("violations")
export class Violation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", name: "user_id" })
  userId: number;

  @Column({ type: "int", name: "reservation_id" })
  reservationId: number;

  @Column({ type: "varchar", length: 40 })
  type: ViolationType;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.violations)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Reservation)
  @JoinColumn({ name: "reservation_id" })
  reservation: Reservation;
}
