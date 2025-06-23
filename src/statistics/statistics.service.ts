import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Appointment } from "src/appointments/schema/appointments.schema";
import { Patient } from "src/patients/schema/patients.schema";

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
  ) {

  }
  async getMonthlyPatientComparison() {
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const endOfThisMonth = new Date();
    endOfThisMonth.setMonth(endOfThisMonth.getMonth() + 1);
    endOfThisMonth.setDate(0);
    endOfThisMonth.setHours(23, 59, 59, 999);

    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    const thisMonthCount = await this.patientModel.countDocuments({
      createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth },
    });

    const lastMonthCount = await this.patientModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    const change = thisMonthCount - lastMonthCount;
    const changeRatio = lastMonthCount
      ? Math.abs(change) / lastMonthCount
      : thisMonthCount > 0
        ? 1
        : 0;

    let trend: 'increase' | 'decrease' | 'no-change';
    if (change > 0) {
      trend = 'increase';
    } else if (change < 0) {
      trend = 'decrease';
    } else {
      trend = 'no-change';
    }

    return {
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      changeRatio: parseFloat((changeRatio * 100).toFixed(2)),
      trend,
    };
  }

  async getDailyAppointmentsComparison() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const endOfYesterday = new Date(endOfToday);
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);

    const todayCount = await this.appointmentModel.countDocuments({
      date: { $gte: startOfToday, $lte: endOfToday },
    });

    const yesterdayCount = await this.appointmentModel.countDocuments({
      date: { $gte: startOfYesterday, $lte: endOfYesterday },
    });

    const change = todayCount - yesterdayCount;
    const changeRatio = yesterdayCount
      ? Math.abs(change) / yesterdayCount
      : todayCount > 0
        ? 1
        : 0;

    let trend: 'increase' | 'decrease' | 'no-change';
    if (change > 0) {
      trend = 'increase';
    } else if (change < 0) {
      trend = 'decrease';
    } else {
      trend = 'no-change';
    }

    return {
      todayCount,
      yesterdayCount,
      changeRatio: parseFloat((changeRatio * 100).toFixed(2)),
      trend,
    };

  }

}