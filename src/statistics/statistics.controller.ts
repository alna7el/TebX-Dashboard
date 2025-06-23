import { Controller, Get } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";

@Controller('stats')
export class StatisticsController {
  constructor(private readonly StatisticsService: StatisticsService) { }

  @Get('/patients/monthly-comparison')
  async getPatientsNumberMonthlyComparison() {
    return await this.StatisticsService.getMonthlyPatientComparison();
  }

  @Get('/appointments/daily-comparison')
  async getAppointmentsNumberMDailyComparison() {
    return await this.StatisticsService.getDailyAppointmentsComparison();
  }

} 