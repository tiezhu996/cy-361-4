import { Controller, Get, Param, Query } from "@nestjs/common";
import { EquipmentService } from "./equipment.service";

@Controller()
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get("api/equipments")
  async getEquipments(@Query("category") category?: string) {
    return this.equipmentService.findAll(category);
  }

  @Get("api/equipments/categories")
  async getCategories() {
    return this.equipmentService.getCategories();
  }

  @Get("api/equipments/:id")
  async getEquipment(@Param("id") id: number) {
    return this.equipmentService.findOne(id);
  }

  @Get("api/equipments/:id/slots")
  async getAvailableSlots(@Param("id") id: number, @Query("date") date: string) {
    if (!date) {
      date = new Date().toISOString().split("T")[0];
    }
    return this.equipmentService.getAvailableSlots(id, date);
  }
}
