import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Appointment } from "./schema/appointments.schema";
import mongoose, { Model, Types } from "mongoose";
import { AppointmentDto } from "./dto/appointment.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { VitalSign } from "src/patients/schema/vital-signs.schema";
import { ClinicService } from "src/clinics/clinic.service";
import { TransactionService } from "src/transactions/transactions.service";
import { CreateTransactionDto } from "src/transactions/dto/create-transaction.dto";
import { Service } from "src/services/schema/service.schema";
import { Counter } from "src/counters/counters.schema";
import { StatusUpdateDto } from "./dto/status-update.dto";
import { UserService } from "src/users/user.service";
import { CancelAppointmentDto } from "./dto/cancel-appointment.dto";
import { DoctorAttendanceService } from "src/doctor_attendance/doctor-attendance.service";
import { PaginationWithFiltersDto } from "./dto/dynamic-filter.dto";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    @InjectModel(VitalSign.name) private readonly vitalSignModel: Model<VitalSign>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    @Inject(forwardRef(() => ClinicService)) private readonly clinicService: ClinicService,
    private readonly doctorAttendanceService: DoctorAttendanceService
  ) { }
  async create(createAppointment: AppointmentDto): Promise<Appointment> {
    const clinic = await this.clinicService.findOne(createAppointment.clinic);

    const appointmentData = {
      ...createAppointment,
      ...(createAppointment.is_waiting_list || createAppointment.is_emergency ? {
        date: new Date().toISOString().split('T')[0]
      } : {})
    };

    const appointment = await this.appointmentModel.create({
      branch: clinic.branch,
      ...appointmentData
    });
    const service = await this.serviceModel.findById(createAppointment.service).exec();
    const total = service.price;
    const tax = total * 15 / 100;
    const netTotal = total + tax;
    const invoiceCounter = await this.counterModel.findOneAndUpdate(
      { key: 'inv_number' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const transactionCounter = await this.counterModel.findOneAndUpdate(
      { key: 'transaction_number' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const invoice_number = `INV-${invoiceCounter.value}`;
    const transaction_number = `TR-${transactionCounter.value}`;

    const createTransactionDto: CreateTransactionDto = {
      type: 'payment',
      total,
      inv_number: invoice_number,
      net_total: netTotal,
      number: transaction_number,
      date: new Date(),
      tax,
      patient: createAppointment.patient,
      services: [createAppointment.service],
      branch: clinic.branch,
      clinic: createAppointment.clinic
    };
    await this.transactionService.create(createTransactionDto);
    return appointment;
  }

  async findAll(paginationDto: PaginationDto, userEmail?: string) {
    const page = parseInt(paginationDto.page as any, 10) || 1;
    const perPage = parseInt(paginationDto.perPage as any, 10) || 10;
    const { clinic, patient, appointment_date_from, appointment_date_to, branch, keyword } = paginationDto;

    const query: any = {};

    if (userEmail) {
      const mongoUser = await this.userService.findByEmail(userEmail);
      if (mongoUser) {
        const user = await this.userService.findOne(mongoUser._id.toString());
        if (user.role_id && user.role_id.name === 'Doctor') {
          query.doctor = mongoUser._id;
        }
      }
    }

    if (clinic && clinic !== "null") query.clinic = clinic;
    if (patient && patient !== "null") query.patient = patient;
    if (branch && branch !== "null") query.branch = branch;

    if (appointment_date_from || appointment_date_to) {
      query.date = {};
      if (appointment_date_from) {
        const startDate = new Date(appointment_date_from);
        startDate.setHours(0, 0, 0, 0);
        query.date.$gte = startDate;
      }
      if (appointment_date_to) {
        const endDate = new Date(appointment_date_to);
        endDate.setHours(23, 59, 59);
        query.date.$lte = endDate;
      }
    }

    const skip = (page - 1) * perPage;

    const keywordPatientCondition = keyword && keyword !== "null"
      ? {
        $or: [
          { first_name_ar: { $regex: keyword, $options: "i" } },
          { first_name_en: { $regex: keyword, $options: "i" } },
          { last_name_ar: { $regex: keyword, $options: "i" } },
          { last_name_en: { $regex: keyword, $options: "i" } },
        ],
      }
      : null;

    const appointments = await this.appointmentModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .populate({
        path: "patient",
        match: keywordPatientCondition,
      })
      .populate("service")
      .populate("doctor")
      .populate("branch")
      .populate({
        path: "clinic",
        model: "Clinic",
        populate: [
          {
            path: "users",
            model: "User",
          },
        ],
      })
      .exec();

    const filteredAppointments = appointments.filter((app) => app.patient);

    const total = filteredAppointments.length;
    const lastPage = Math.ceil(total / perPage);
    const from = total > 0 ? (page - 1) * perPage + 1 : 0;
    const to = Math.min(page * perPage, total);

    return {
      from,
      to,
      total,
      page,
      per_page: perPage,
      last_page: lastPage,
      results: filteredAppointments,
    };
  }

  async findById(id: string) {
    const appointment = await this.appointmentModel.findOne({ _id: id })
      .populate({
        path: 'patient',
        model: 'Patient',
        populate: [
          {
            path: 'vital-signs',
            model: 'VitalSign'
          },
          {
            path: 'diagnosis',
            model: 'Diagnosis',
            populate: [
              {
                path: 'initial',
                model: 'Icd'
              },
              {
                path: 'secondary',
                model: 'Icd'
              },
              {
                path: 'differential',
                model: 'Icd'
              }


            ]
          },
          {
            path: 'prescription',
            model: 'Priscription'
          }
        ]
      })
      .populate('service')
      .populate('branch')
      .populate('doctor')
      .populate({
        path: 'clinic',
        model: 'Clinic',
        populate: [
          {
            path: 'users',
            model: 'User'
          }]
      })
      .exec();
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    const latestVitalSign = await this.vitalSignModel
      .findOne({ patient: appointment.patient })
      .sort({ createdAt: -1 })
      .exec();
    return {
      ...appointment.toObject(),
      latestVitalSign,
    };

  }

  async findByDoctorAndDate(doctor: string, clinic: string, date: string) {
    const inputDate = new Date(date);
    const startOfDay = new Date(inputDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return await this.appointmentModel.find({
      doctor,
      clinic,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
  }

  async deleteById(id: string) {
    return await this.appointmentModel.deleteOne({ _id: id }).exec();
  }

  async update(id: string, appointmentDto: AppointmentDto) {
    return await this.appointmentModel.findByIdAndUpdate(
      id,
      {
        ...appointmentDto
      }, {
      new: true
    }

    )
      .populate('patient')
      .populate('service')
      .populate('branch')
      .populate('clinic')
      .exec();
  }

  async addComplaint(id: string, complaint: string) {
    return await this.appointmentModel.findByIdAndUpdate(
      id,
      {
        complaint,
        complaint_date: new Date()
      }, {
      new: true
    }
    )
      .populate('patient')
      .populate('service')
      .populate('branch')
      .populate('clinic')
      .exec();
  }
  async addVisitSummary(id: string, visit_summary: string) {
    return await this.appointmentModel.findByIdAndUpdate(
      id,
      {
        visit_summary,
        visit_summary_date: new Date()
      }, {
      new: true
    }
    )
      .populate('patient')
      .populate('service')
      .populate('branch')
      .populate('clinic')
      .exec();
  }

  async addTreatmentPlan(id: string, treatment_plan: string) {
    return await this.appointmentModel.findByIdAndUpdate(
      id,
      {
        treatment_plan,
        treatment_plan_date: new Date()
      }, {
      new: true
    }
    )
      .populate('patient')
      .populate('service')
      .populate('branch')
      .populate('clinic')
      .exec();
  }

  async addMedicalRecord(id: string, medical_record: string) {
    return await this.appointmentModel.findByIdAndUpdate(
      id,
      {
        medical_record,
        medical_record_date: new Date()
      }, {
      new: true
    }
    )
      .populate('patient')
      .populate('service')
      .populate('branch')
      .populate('clinic')
      .exec();
  }

  async updateStatus(statusUpdateDto: StatusUpdateDto) {
    return await this.appointmentModel.findByIdAndUpdate(statusUpdateDto.id, {
      status: statusUpdateDto.status
    }, { new: true })
  }

  async cancelAppointment(cancelAppointmentDto: CancelAppointmentDto, userEmail: string) {
    const mongoUser = await this.userService.findByEmail(userEmail);
    if (!mongoUser) {
      throw new ForbiddenException('User with provided email not found');
    }

    const user = await this.userService.findOne(mongoUser._id.toString())
    if (!user.role_id || (user.role_id.name !== 'receptionist' && user.role_id.name !== 'Admin')) {
      throw new ForbiddenException('User must be a admin or receptionist to cancel an appointment');
    }

    const appointment = await this.appointmentModel.findOne({ _id: new Types.ObjectId(cancelAppointmentDto.id) })

    if (!appointment) {
      throw new ForbiddenException('Appointment not found');
    }
    if (appointment.status !== 'Booked') {
      throw new ForbiddenException('Appointment status must be "Booked" to cancel');
    }
    return await this.appointmentModel.findOneAndUpdate(new Types.ObjectId(cancelAppointmentDto.id), {
      status: 'Cancelled',
      'reason': cancelAppointmentDto.reason
    }, { new: true }).exec();
  }

  async findCompleted(paginationDto: PaginationDto) {
    const page = parseInt(paginationDto.page as any, 10) || 1;
    const perPage = parseInt(paginationDto.perPage as any, 10) || 10;
    const { clinic, patient, appointment_date_from, appointment_date_to,
      branch } = paginationDto;
    const query: any = {};
    query.status = 'Completed';
    if (clinic && clinic != "null") {
      query.clinic = clinic;
    }
    if (patient && patient != "null") {
      query.patient = patient;
    }
    if (branch && branch != "null") {
      query.branch = branch;
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
    const skip = (page - 1) * perPage;
    const total = await this.appointmentModel
      .countDocuments({
        ...query,
      })
      .exec();

    const appointments = await this.appointmentModel.find(query)
      .skip(skip)
      .limit(perPage)
      .populate({
        path: "patient",
      })
      .populate('service')
      .populate('doctor')
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
    const filteredAppointments = appointments.filter(
      (app) => app.patient
    );
    const lastPage = Math.ceil(total / perPage);
    const from = skip + 1;
    const to = Math.min(skip + perPage, total);

    return {
      from,
      to,
      total,
      page,
      per_page: perPage,
      last_page: lastPage,
      results: filteredAppointments,
    };

  }

  async startAppointment(id: string, doctorEmail: string) {
    const mongoUser = await this.userService.findByEmail(doctorEmail);
    if (!mongoUser) {
      throw new ForbiddenException('Doctor with provided email not found');
    }
    const user = await this.userService.findOne(mongoUser._id.toString())
    if (!user.role_id || user.role_id.name !== 'Doctor') {
      throw new ForbiddenException('User must be a doctor to start an appointment');
    }
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) {
      throw new ForbiddenException('Appointment not found');
    }
    if (appointment.doctor.toString() !== mongoUser._id.toString()) {
      throw new ForbiddenException('Appointment not assigned to this doctor');
    }
    if (appointment.status !== 'Booked') {
      throw new ForbiddenException('Invalid appointment status, expected status to be "Booked"');
    }
    await appointment.updateOne({
      status: 'In-progress',
    }, { new: true })
    return appointment;
  }

  async getBookedAppointments(userId: string, clinicId: string, selectedDate: Date, appointmentId?: string) {
    if (appointmentId) {
      return await this.appointmentModel.find({
        doctor: userId,
        clinic: clinicId,
        date: selectedDate,
        _id: { $ne: appointmentId }
      });
    }
    return await this.appointmentModel.find({
      doctor: userId,
      date: selectedDate,
    });
  }

  async findAppointmentsByClinicAndDoctor(clinicId: string, doctorId: string) {
    const appointments = await this.appointmentModel.find({
      clinic: clinicId,
      doctor: doctorId
    }).exec();
    const mappedAppointments = appointments.map(appointment => {
      return {
        date: appointment.date,
        time: appointment.time,
      }
    });
    return mappedAppointments;

  }

  async findOneByClinicDateTime(clinic: string, date: string, time: string) {
    const inputDate = new Date(date);
    const startOfDay = new Date(inputDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    return this.appointmentModel.findOne({
      clinic,
      date: { $gte: startOfDay, $lte: endOfDay },
      time,
    });
  }

  async findAllForReceptionist(paginationDto: PaginationWithFiltersDto, clinicId: string) {
    const page = parseInt(paginationDto.page as any, 10) || 1;
    const perPage = parseInt(paginationDto.perPage as any, 10) || 10;

    const {
      from_date,
      to_date,
      doctor,
      name,
      medical_file_number,
      appointment_type,
      patient_arrival_time,
      time,
      keyword,
      sortBy,
      sortDirection
    } = paginationDto;

    const pipeline: any[] = [];

    const matchStage: any = {
      clinic: new mongoose.Types.ObjectId(clinicId),
      is_waiting_list: false,
      status: { $nin: ['Cancelled'] }
    };

    if (from_date || to_date) {
      matchStage.date = {};
      if (from_date) {
        const startDate = new Date(from_date);
        startDate.setHours(0, 0, 0, 0);
        matchStage.date.$gte = startDate;
      }
      if (to_date) {
        const endDate = new Date(to_date);
        endDate.setHours(23, 59, 59, 999);
        matchStage.date.$lte = endDate;
      }
    }

    if (doctor) matchStage.doctor = new mongoose.Types.ObjectId(doctor);
    if (appointment_type) matchStage.appointment_type = appointment_type;
    if (time) matchStage.time = time;

    if (patient_arrival_time) {
      const [hours, minutes] = patient_arrival_time.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;

      matchStage.$expr = {
        $and: [
          { $ne: ['$patient_arrival_time', null] },
          {
            $eq: [
              timeInMinutes,
              {
                $add: [
                  { $multiply: [{ $hour: '$patient_arrival_time' }, 60] },
                  { $minute: '$patient_arrival_time' }
                ]
              }
            ]
          }
        ]
      };
    }

    pipeline.push({ $match: matchStage });
    pipeline.push(
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patient'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $lookup: {
          from: 'clinics',
          localField: 'clinic',
          foreignField: '_id',
          as: 'clinic'
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch'
        }
      }
    );
    pipeline.push(
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: false } },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$clinic', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } }
    );

    const finalMatchConditions: any = {};

    if (name) {
      finalMatchConditions.$or = finalMatchConditions.$or || [];
      finalMatchConditions.$or.push(
        { 'patient.first_name_ar': { $regex: name, $options: 'i' } },
        { 'patient.first_name_en': { $regex: name, $options: 'i' } },
        { 'patient.last_name_ar': { $regex: name, $options: 'i' } },
        { 'patient.last_name_en': { $regex: name, $options: 'i' } }
      );
    }

    if (medical_file_number) {
      finalMatchConditions['patient.medical_file_number'] = medical_file_number;
    }

    if (keyword && keyword !== 'null') {
      finalMatchConditions.$or = finalMatchConditions.$or || [];
      finalMatchConditions.$or.push(
        // Patient fields
        { 'patient.first_name_ar': { $regex: keyword, $options: 'i' } },
        { 'patient.first_name_en': { $regex: keyword, $options: 'i' } },
        { 'patient.last_name_ar': { $regex: keyword, $options: 'i' } },
        { 'patient.last_name_en': { $regex: keyword, $options: 'i' } },
        // Doctor fields
        { 'doctor.firstName': { $regex: keyword, $options: 'i' } },
        { 'doctor.firstNameAR': { $regex: keyword, $options: 'i' } },
        { 'doctor.lastName': { $regex: keyword, $options: 'i' } },
        { 'doctor.lastNameAR': { $regex: keyword, $options: 'i' } },
        // Clinic fields
        { 'clinic.name_ar': { $regex: keyword, $options: 'i' } },
        { 'clinic.name_en': { $regex: keyword, $options: 'i' } },
        // Appointment fields
        { appointment_type: { $regex: keyword, $options: 'i' } },
        { status: { $regex: keyword, $options: 'i' } }
      );
    }

    if (Object.keys(finalMatchConditions).length > 0) {
      pipeline.push({ $match: finalMatchConditions });
    }
    const countPipeline = [...pipeline, { $count: 'total' }];
    const sortStage: any = {};
    if (sortBy) {
      const direction = sortDirection === 'desc' ? -1 : 1;
      if (sortBy === 'name') {
        sortStage['patient.first_name_ar'] = direction;
      } else {
        sortStage[sortBy] = direction;
      }
    } else {
      sortStage.time = 1;
    }
    pipeline.push({ $sort: sortStage });
    pipeline.push(
      { $skip: (page - 1) * perPage },
      { $limit: perPage }
    );
    pipeline.push({
      $project: {
        'doctor.password': 0,
        'patient.password': 0
      }
    });
    const [appointmentsResult, countResult] = await Promise.all([
      this.appointmentModel.aggregate(pipeline).exec(),
      this.appointmentModel.aggregate(countPipeline).exec()
    ]);
    console.log(pipeline);

    const total = countResult[0]?.total || 0;
    const lastPage = Math.ceil(total / perPage);
    const from = total > 0 ? (page - 1) * perPage + 1 : 0;
    const to = Math.min(page * perPage, total);

    return {
      from,
      to,
      total,
      page,
      per_page: perPage,
      last_page: lastPage,
      results: appointmentsResult,
    };
  }

  async markPatientAsPresent(appointmentId: string) {
    return await this.appointmentModel.findByIdAndUpdate(appointmentId, {
      patient_arrival_time: new Date(),
      in_progress_stage: 'arrived'
    }, { new: true });
  }

  async getStats(clinicId: string) {
    if (!clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const clinic = await this.clinicService.findOne(clinicId);
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    try {
      const baseQuery = {
        clinic: clinicId,
        date: { $gte: today, $lt: tomorrow }
      };
      const [totalAppointments, remainingAppointments, waitingListAppointments] = await Promise.all([
        this.appointmentModel.countDocuments(baseQuery),
        this.appointmentModel.countDocuments({
          ...baseQuery,
          status: { $nin: ['Completed', 'Cancelled'] }
        }),
        this.appointmentModel.countDocuments({
          ...baseQuery,
          is_waiting_list: true
        })
      ]);
      return {
        totalAppointments,
        remainingAppointments,
        waitingListAppointments,
        date: today.toISOString().split('T')[0]
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve appointment statistics', error);
    }
  }
}