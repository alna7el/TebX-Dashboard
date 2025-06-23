import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DoctorAttendance } from "./schema/doctor-attendance.schema";
import { DoctorAttendanceDto } from "./dto/doctor-attendance.dto";

@Injectable()
export class DoctorAttendanceService {
  constructor(@InjectModel(DoctorAttendance.name) private doctorAttendanceModel: Model<DoctorAttendance>) { }

  async create(doctorAttendanceDto: DoctorAttendanceDto) {
    const { doctor, clinic } = doctorAttendanceDto;
    const date = new Date();

    const attendancePromises = doctor.map(doctorId =>
      this.doctorAttendanceModel.create({
        doctor: doctorId,
        clinic,
        date
      })
    );

    const attendanceRecords = await Promise.all(attendancePromises);
    return attendanceRecords;
  }

  async findAttendanceByClinic(clinic: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const doctors = await this.doctorAttendanceModel.find({
      clinic,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    })
      .populate({
        path: 'doctor',
        select: '_id firstName firstNameAR lastName lastNameAR'
      })
      .select('doctor')
      .exec();
    return doctors.map(doc => doc.doctor);
  }
}
