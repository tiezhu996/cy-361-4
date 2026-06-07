import { IsInt, IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateReservationDto {
  @IsInt()
  @IsNotEmpty()
  equipmentId!: number;

  @IsInt()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @IsString()
  @IsOptional()
  purpose?: string;
}
