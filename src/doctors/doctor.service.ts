import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Appointment } from "src/appointments/schema/appointments.schema";
import { AppointmentFiltersDto } from "src/practitionar/filters/appointments.filters.dto";
import { UserService } from "src/users/user.service";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { ProviderBranch } from "src/branches/schema/branch.schema";
import { DoctorAttendanceService } from "src/doctor_attendance/doctor-attendance.service";
import { userDocument } from "src/users/schemas/user.schema";

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Clinic.name) private readonly clinicModel: Model<Clinic>,
    @InjectModel(ProviderBranch.name) private readonly branchModel: Model<ProviderBranch>,
    private readonly userService: UserService,
    private readonly doctorAttendanceService: DoctorAttendanceService
  ) { }

  async getAppointments(appointmentFiltersDto: AppointmentFiltersDto, email: string) {
    const mongoUser = await this.userService.findByEmail(email);
    const user = await this.userService.findOne(mongoUser._id.toString());
    const { appointment_date_from, appointment_date_to } = appointmentFiltersDto;
    const query: any = {};
    if (user.clinics && user.clinics.length > 0) {
      query.clinic = { $in: user.clinics };
    }
    if (appointment_date_from || appointment_date_to) {
      query.date = {};
      if (appointment_date_from) {
        const startDate = new Date(appointment_date_from);
        startDate.setHours(0, 0, 0, 0);
        query.date.$gte = startDate;
      }
      if (appointment_date_to) {
        const endDate = new Date(appointment_date_to);
        endDate.setHours(23, 59, 59)
        query.date.$lte = endDate;
      }
    }
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

  async getCompletedAppointments(appointmentFiltersDto: AppointmentFiltersDto, email: string) {
    const mongoUser = await this.userService.findByEmail(email);
    const user = await this.userService.findOne(mongoUser._id.toString());
    const { appointment_date_from, appointment_date_to } = appointmentFiltersDto;
    const query: any = {};
    if (user.clinics && user.clinics.length > 0) {
      query.clinic = { $in: user.clinics };
    }
    query.status = 'Completed';
    if (appointment_date_from || appointment_date_to) {
      query.date = {};
      if (appointment_date_from) {
        const startDate = new Date(appointment_date_from);
        startDate.setHours(0, 0, 0, 0);
        query.date.$gte = startDate;
      }
      if (appointment_date_to) {
        const endDate = new Date(appointment_date_to);
        endDate.setHours(23, 59, 59)
        query.date.$lte = endDate;
      }
    }
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

  async getAppointmentsStatusStats(email: string) {
    const mongoUser = await this.userService.findByEmail(email);
    const clinics = (await this.userService.findOne(mongoUser._id.toString())).clinics;
    const counts = await this.appointmentModel.aggregate([
      {
        $match: {
          clinic: { $in: clinics },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const stats = counts.reduce(
      (acc, item) => {
        if (item._id === 'Completed') {
          acc.completed = item.count;
        } else {
          acc.notCompleted += item.count;
        }
        return acc;
      },
      { completed: 0, notCompleted: 0 },
    );
    return { stats, clinics };
  }

  async getClinics(email: string) {
    const mongoUser = await this.userService.findByEmail(email);
    const user = await this.userService.findOne(mongoUser._id.toString());

    if (!user.clinics || user.clinics.length === 0) {
      return [];
    }

    const clinics = await this.clinicModel.find({
      _id: { $in: user.clinics }
    }).exec();

    return clinics;
  }

  async getBranches(email: string) {
    const mongoUser = await this.userService.findByEmail(email);
    const user = await this.userService.findOne(mongoUser._id.toString());

    const branches = await this.branchModel.find({
      _id: { $in: user.branch ? [user.branch] : [] }
    }).exec();

    return branches;
  }

  async listDoctorsByClinic(clinicId: string) {
    const doctors = await this.userService.findDoctorsByClinic(clinicId);
    const attendingDoctors = await this.doctorAttendanceService.findAttendanceByClinic(clinicId) as userDocument[];
    const attendingDoctorIds = attendingDoctors.map(doc => doc._id.toString());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const doctorsWithStats = await Promise.all(doctors.map(async (doctor) => {
      const [total, completed] = await Promise.all([
        this.appointmentModel.countDocuments({
          clinic: clinicId,
          doctor: doctor._id,
          date: { $gte: today, $lt: tomorrow }
        }),
        this.appointmentModel.countDocuments({
          clinic: clinicId,
          doctor: doctor._id,
          status: 'Completed',
          date: { $gte: today, $lt: tomorrow }
        })
      ]);
      const isAttending = attendingDoctorIds.includes(doctor._id.toString());

      return {
        doctor: {
          _id: doctor._id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          firstNameAR: doctor.firstNameAR,
          lastNameAR: doctor.lastNameAR,
          status: doctor.status,
          isAttending
        },
        stats: {
          total,
          completed,
          remaining: total - completed
        }
      };
    }));

    return doctorsWithStats;
  }
}