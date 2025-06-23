import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProviderBranch } from "src/branches/schema/branch.schema";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { Icd } from "src/icd10/schema/icd.schema";
import { Patient } from "src/patients/schema/patients.schema";
import { Service } from "src/services/schema/service.schema";
import { User } from "src/users/schemas/user.schema";
import { Role } from "src/roles/schemas/role.schema";
import { DoctorAttendanceService } from "src/doctor_attendance/doctor-attendance.service";

@Injectable()
export class LookupService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(ProviderBranch.name) private readonly branchModel: Model<ProviderBranch>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Clinic.name) private readonly clinicModel: Model<Clinic>,
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
    @InjectModel(Icd.name) private readonly icdModel: Model<Icd>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly doctorAttendanceService: DoctorAttendanceService,
  ) { }
  async getUsers(role_id?: string) {
    if (role_id) {
      return await this.userModel.find({ role_id }).exec();
    }
    return await this.userModel.find().exec();
  }
  async getBranches(userId: string) {
    if (userId && userId != "null") {
      const user = await this.userModel.findById(userId).populate('branch')
        .exec();
      if (!user) {
        return [];
      }
      return [user.branch]

    }

    return await this.branchModel.find()
      .populate('clinics')
      .exec();
  }
  async getServices() {
    return await this.serviceModel.find({ 'status': 'active' }).exec();
  }
  async getClinics(branch?: string) {
    const query: any = {};
    if (branch && branch !== "null") {
      query.branch = branch;
    }
    return await this.clinicModel.find(query).exec();
  }
  async getPatients(keyword: string) {
    const query: any = {};
    if (keyword && keyword != "null") {
      query.$or = [
        { first_name_ar: { $regex: keyword, $options: 'i' } },
        { first_name_en: { $regex: keyword, $options: 'i' } },
        { last_name_ar: { $regex: keyword, $options: 'i' } },
        { last_name_en: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { national_id: { $regex: keyword, $options: 'i' } }
      ];
    }
    return await this.patientModel.find(query).exec();
  }
  async getIcds(keyword?: string) {
    const query: any = {};

    if (keyword && keyword != "null") {
      query.$or = [
        { code: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ]
    }

    return await this.icdModel.find(query).limit(10).exec();
  }
  async getDoctors(clinicIds?: string[]) {
    const roles = await this.roleModel.find().exec();
    const doctorRole = roles.find(role => role.name === "Doctor");

    if (!doctorRole) {
      throw new Error('Doctor role not found');
    }

    const query: any = { role_id: doctorRole._id };

    if (clinicIds && clinicIds.length > 0) {
      const validClinicIds = clinicIds.filter(id => id !== "null");
      if (validClinicIds.length > 0) {
        query.clinics = { $in: validClinicIds };
      }
    }
    const doctors = await this.userModel.find(query)
      .populate('speciality')
      .populate('clinics')
      .exec();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const attendanceQuery: any = { date: { $gte: today, $lt: tomorrow } };
    if (clinicIds && clinicIds.length > 0) {
      const validClinicIds = clinicIds.filter(id => id !== "null");
      if (validClinicIds.length > 0) {
        attendanceQuery.clinic = { $in: validClinicIds };
      }
    }
    const attendances = await this.doctorAttendanceService["doctorAttendanceModel"].find(attendanceQuery).exec();
    const attendedDoctorIds = new Set(attendances.map(a => a.doctor.toString()));
    return doctors.map(doctor => {
      const docObj = doctor.toObject() as any;
      docObj.isattendingtoday = attendedDoctorIds.has(doctor._id.toString());
      return docObj;
    });
  }
}