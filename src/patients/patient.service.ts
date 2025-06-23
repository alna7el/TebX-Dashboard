import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from './schema/patients.schema';
import { PatientDto } from './dto/patient.dto';
import { PatientListDto } from './dto/patient-list.dto';
import { UserService } from 'src/users/user.service';
import { VitalSignDTO } from './dto/vital-sign.dto';
import { VitalSign } from './schema/vital-signs.schema';
import { PrescriptionDto } from './dto/prescription.dto';
import { Diagnosis } from 'src/diagnosis/schema/diagnosis.schema';
import { DiagnosisDTO } from './dto/diagnosis.dto';
import { Appointment } from 'src/appointments/schema/appointments.schema';
import { AppointmentDto } from './dto/appointment.dto';
import { Prescription } from 'src/prescriptions/schema/prescription.schema';
import { Counter } from 'src/counters/counters.schema';
@Injectable()
export class PatientService {
  constructor(@InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
    @InjectModel(VitalSign.name) private readonly vitalSignModel: Model<VitalSign>,
    @InjectModel(Prescription.name) private readonly prescriptionModel: Model<Prescription>,
    @InjectModel(Diagnosis.name) private readonly diagnosisModel: Model<Diagnosis>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,

    private readonly UserService: UserService
  ) { }

  private buildSearchQuery(keyword?: string, name?: string, phone?: string): any {
    const query: any = {};

    // Handle keyword search with word splitting for better first/last name search
    if (keyword && keyword !== "null") {
      const terms = keyword.trim().split(/\s+/).map(term =>
        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      );
      if (terms.length > 1) {
        query.$and = terms.map(term => ({
          $or: [
            { first_name_ar: { $regex: term, $options: 'i' } },
            { first_name_en: { $regex: term, $options: 'i' } },
            { last_name_ar: { $regex: term, $options: 'i' } },
            { last_name_en: { $regex: term, $options: 'i' } },
            { phone: { $regex: term, $options: 'i' } },
            { email: { $regex: term, $options: 'i' } },
            { medical_file_number: { $regex: term, $options: 'i' } }

          ]
        }));
      } else {
        query.$or = [
          { first_name_ar: { $regex: keyword, $options: 'i' } },
          { first_name_en: { $regex: keyword, $options: 'i' } },
          { last_name_ar: { $regex: keyword, $options: 'i' } },
          { last_name_en: { $regex: keyword, $options: 'i' } },
          { phone: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
          { medical_file_number: { $regex: keyword, $options: 'i' } }

        ];
      }
    }

    if (name && name !== "null") {
      const nameOr = [
        { first_name_ar: { $regex: name, $options: 'i' } },
        { first_name_en: { $regex: name, $options: 'i' } },
        { last_name_ar: { $regex: name, $options: 'i' } },
        { last_name_en: { $regex: name, $options: 'i' } }
      ];

      if (query.$and) {
        query.$and.push({ $or: nameOr });
      } else if (query.$or) {
        query.$or.push(...nameOr);
      } else {
        query.$or = nameOr;
      }
    }

    if (phone && phone !== "null") {
      query.phone = { $regex: phone, $options: 'i' };
    }

    return query;
  }

  private buildSortObject(sortBy?: string, sortDirection?: string, acceptLanguage?: string): any {
    const sort: any = {};
    const direction = sortDirection === 'desc' ? -1 : 1;

    if (sortBy === 'name') {
      const language = acceptLanguage?.toLowerCase().includes('ar') ? 'ar' : 'en';
      sort[`first_name_${language}`] = direction;
      sort[`last_name_${language}`] = direction;
    } else if (sortBy) {
      sort[sortBy] = direction;
    } else {
      sort.createdAt = -1;
    }
    return sort;
  }

  private async getPaginatedResults(query: any, sort: any, skip: number, perPage: number) {
    return this.patientModel.find(query)
      .sort(sort)
      .collation({ locale: 'en', strength: 2 })
      .skip(skip)
      .limit(perPage)
      .populate('added_by')
      .populate('modified_by')
      .populate({
        path: 'prescription',
        model: 'Prescription'
      })
      .exec();
  }

  async findAll(patientListDto: PatientListDto, acceptLanguage: string) {
    const { page = 1, perPage = 10, keyword, name, phone, sortBy, sortDirection } = patientListDto;
    const skip = (page - 1) * perPage;

    const query = this.buildSearchQuery(keyword, name, phone);
    const sort = this.buildSortObject(sortBy, sortDirection, acceptLanguage);
    const [results, total] = await Promise.all([
      this.getPaginatedResults(query, sort, skip, perPage),
      this.patientModel.countDocuments(query).exec(),
    ]);

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
      results,
    };
  }

  async findOne(id: string): Promise<Patient> {
    return this.patientModel.findOne({ _id: id })
      .populate('added_by')
      .populate('modified_by')
      .populate({
        path: 'vital-signs',
        model: 'VitalSign',
        populate: {
          path: 'collected_by',
          model: 'User'
        }
      })
      .populate({
        path: 'prescription',
        model: 'Prescription'
      })
      .populate({
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
      })
      .exec();
  }

  async create(createPatient: PatientDto, email: string): Promise<Patient> {
    const mongoUser = await this.UserService.findByEmail(email);
    const patientData = {
      ...createPatient,
      medical_file_number: `MRN-${Math.floor(1000 + Math.random() * 9000)}`,
      added_by: mongoUser._id.toString(),
      added_by_at: new Date()
    }

    return await this.patientModel.create(patientData);
  }
  async update(id: string, createPatient: PatientDto, email: string

  ) {
    const mongoUser = await this.UserService.findByEmail(email);

    return await this.patientModel.findByIdAndUpdate(
      id, {
      ...createPatient,
      modified_by: mongoUser._id.toString(),
      modified_at: new Date(),
    });
  }
  async addVitalSigns(vitalSignDTO: VitalSignDTO) {
    await this.vitalSignModel.create(vitalSignDTO);
  }
  async addPrescription(prescriptionDto: PrescriptionDto, email: string) {
    const mongoUser = await this.UserService.findByEmail(email);
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'prescription_number' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const appointment = await this.appointmentModel.findById(prescriptionDto.appointment).exec();

    if (counter) {
      const prescriptionData = {
        ...prescriptionDto,
        clinic: appointment.clinic,
        added_by: mongoUser,
        number: `PR-${counter.value}`
      }
      await this.prescriptionModel.create(prescriptionData);
    } else {
      throw new Error('Error generating prescription number');
    }
  }
  async addDiagnosis(diagnosisDto: DiagnosisDTO) {
    await this.diagnosisModel.create(diagnosisDto);
  }

  async getAppointments(patient: string, appointmentDto?: AppointmentDto) {
    const query: any = {};
    const { from_date, to_date } = appointmentDto;
    if (from_date || to_date) {
      query.date = {};
      if (from_date) {
        const startDate = new Date(from_date);
        startDate.setHours(0, 0, 0, 0);
        query.date.$gte = startDate;
      }
      if (to_date) {
        const endDate = new Date(to_date);
        endDate.setHours(23, 59, 59)
        query.date.$lte = endDate;
      }
    }
    return await this.appointmentModel.find(query).where({
      patient
    }).populate({
      path: 'clinic',
      model: 'Clinic',
    }).populate({
      path: 'patient',
      model: 'Patient',
      populate: {
        path: 'prescription',
        model: 'Prescription'
      }
    });
  }


}