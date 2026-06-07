import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Reservation } from "./reservation.entity";

@Entity("equipments")
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 120 })
  name: string;

  @Column({ type: "varchar", length: 80, nullable: true })
  model: string;

  @Column({ type: "varchar", length: 80, unique: true, name: "serial_number" })
  serialNumber: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  location: string;

  @Column({ type: "varchar", length: 60, nullable: true })
  category: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "date", name: "purchase_date", nullable: true })
  purchaseDate: Date;

  @Column({ type: "varchar", length: 255, name: "image_url", nullable: true })
  imageUrl: string;

  @Column({ type: "varchar", length: 20, default: "available" })
  status: string;

  @Column({ type: "boolean", name: "requires_certification", default: false })
  requiresCertification: boolean;

  @Column({ type: "int", name: "min_reserve_minutes", default: 30 })
  minReserveMinutes: number;

  @Column({ type: "int", name: "max_reserve_hours", default: 8 })
  maxReserveHours: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.equipment)
  reservations: Reservation[];
}
