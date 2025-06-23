import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Appointment } from "src/appointments/schema/appointments.schema";
import { AppointmentFiltersDto } from "./filters/appointments.filters.dto";
import { UserService } from "src/users/user.service";

interface AppointmentQuery {
  clinic?: { $in: string[] };
  patient?: string;
  branch?: string;
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
}

@Injectable()
export class PractitionarService {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    private readonly userService: UserService
  ) { }

  private buildDateQuery(appointment_date_from?: string, appointment_date_to?: string): { $gte?: Date; $lte?: Date } {
    const dateQuery: { $gte?: Date; $lte?: Date } = {};

    if (appointment_date_from) {
      const startDate = new Date(appointment_date_from);
      startDate.setHours(0, 0, 0, 0);
      dateQuery.$gte = startDate;
    }

    if (appointment_date_to) {
      const endDate = new Date(appointment_date_to);
      endDate.setHours(23, 59, 59);
      dateQuery.$lte = endDate;
    }

    return dateQuery;
  }

  private buildQuery(filters: AppointmentFiltersDto, userClinics: any[]): AppointmentQuery {
    const query: AppointmentQuery = {};

    if (userClinics?.length > 0) {
      query.clinic = {
        $in: userClinics.map((clinic: any) => clinic._id)
      };
    }

    if (filters.patient && filters.patient !== "null") {
      query.patient = filters.patient;
    }

    if (filters.branch && filters.branch !== "null") {
      query.branch = filters.branch;
    }

    const dateQuery = this.buildDateQuery(filters.appointment_date_from, filters.appointment_date_to);
    if (Object.keys(dateQuery).length > 0) {
      query.date = dateQuery;
    }

    return query;
  }

  async getAppointments(appointmentFiltersDto: AppointmentFiltersDto, email: string) {
    const mongoUser = await this.userService.findByEmail(email);
    if (!mongoUser) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userService.findOne(mongoUser._id.toString());
    if (!user) {
      throw new NotFoundException('User details not found');
    }

    const query = this.buildQuery(appointmentFiltersDto, user.clinics);

    const appointments = await this.appointmentModel.find(query)
      .populate('patient')
      .populate('service')
      .populate('branch')
      .populate({
        path: 'clinic',
        model: 'Clinic',
        populate: [
          {
            path: 'users',
            model: 'User'
          },
        ]
      })
      .exec();

    return appointments;
  }
}