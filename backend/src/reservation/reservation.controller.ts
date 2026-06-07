import { Controller, Get, Post, Param, Body, Query, Patch, HttpCode, HttpStatus } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { CheckinDto } from "./dto/checkin.dto";

@Controller()
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post("api/reservations")
  async create(@Body() dto: CreateReservationDto) {
    return this.reservationService.create(dto);
  }

  @Get("api/reservations")
  async findAll(
    @Query("userId") userId?: number,
    @Query("status") status?: string,
    @Query("equipmentId") equipmentId?: number,
  ) {
    return this.reservationService.findAll(userId, status, equipmentId);
  }

  @Get("api/reservations/today")
  async getTodayReservations() {
    return this.reservationService.getTodayReservations();
  }

  @Get("api/reservations/violations")
  async getViolations(@Query("userId") userId?: number) {
    return this.reservationService.getViolations(userId);
  }

  @Get("api/reservations/violations/count")
  async getViolationCount(@Query("userId") userId?: number) {
    return { count: await this.reservationService.getViolationCount(userId) };
  }

  @Get("api/reservations/:id")
  async findOne(@Param("id") id: number) {
    return this.reservationService.findOne(id);
  }

  @Get("api/reservations/qr/:token")
  async findByQrToken(@Param("token") token: string) {
    return this.reservationService.findByQrToken(token);
  }

  @Post("api/reservations/checkin")
  @HttpCode(HttpStatus.OK)
  async checkin(@Body() dto: CheckinDto) {
    return this.reservationService.checkin(dto.qrCodeToken);
  }

  @Post("api/reservations/checkout")
  @HttpCode(HttpStatus.OK)
  async checkout(@Body() dto: CheckinDto) {
    return this.reservationService.checkout(dto.qrCodeToken);
  }

  @Patch("api/reservations/:id/cancel")
  async cancel(@Param("id") id: number) {
    return this.reservationService.cancel(id);
  }

  @Post("api/reservations/process-violations")
  @HttpCode(HttpStatus.OK)
  async processViolations() {
    const count = await this.reservationService.processViolations();
    return { processed: count };
  }
}
