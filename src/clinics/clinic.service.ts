import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { Clinic } from './schemas/clinic.schema';
import { ClinicListDto } from './dto/clinic-list.dto';
import { ClinicDto } from './dto/clinic.dto';
import { ListUserDto } from 'src/users/dto/list-user.dto';
import { UserService } from 'src/users/user.service';
import { AppointmentService } from 'src/appointments/appointment.service';
import { Counter } from 'src/counters/counters.schema';

@Injectable()
export class ClinicService {
  constructor(
    @InjectModel(Clinic.name) private readonly clinicModel: Model<Clinic>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => AppointmentService)) private readonly appointmentService: AppointmentService
  ) { }


  async findAll(clinicListDto: ClinicListDto) {
    const { page, perPage, name, branch, keyword } = clinicListDto;
    const query: any = {};

    // Build the query
    if (keyword && keyword !== "null") {
      query.$or = [
        { name_ar: { $regex: keyword, $options: 'i' } },
        { name_en: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (name && name !== "null") {
      query.$or = [
        { name_ar: { $regex: name, $options: 'i' } },
        { name_en: { $regex: name, $options: 'i' } },
      ];
    }
    if (branch) {
      query.branch = new mongoose.Types.ObjectId(branch);
    }

    // Pagination variables
    const limit = page && perPage ? parseInt(perPage as any, 10) : null;
    const skip = page && perPage ? (page - 1) * limit : 0;

    const aggregationPipeline: PipelineStage[] = [
      { $match: query },
      {
        $lookup: {
          from: 'providerbranches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch'
        }
      },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'clinics',
          as: 'users'
        }
      },
      { $addFields: { userCount: { $size: '$users' } } },
      { $project: { users: 0 } },
    ];

    // Add sorting, pagination, and limit to the aggregation pipeline
    if (limit) {
      aggregationPipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      );
    }

    const [results, total] = await Promise.all([
      this.clinicModel.aggregate(aggregationPipeline),
      this.clinicModel.countDocuments(query).exec(),
    ]);

    const lastPage = limit ? Math.ceil(total / limit) : 1;
    const from = limit ? skip + 1 : 1;
    const to = limit ? Math.min(skip + limit, total) : total;

    return {
      from,
      to,
      total,
      page: page || 1,
      per_page: perPage || total,
      last_page: lastPage,
      results,
    };
  }

  async findOne(id: string): Promise<Clinic> {
    return this.clinicModel.findOne({ _id: id })
      .populate('branch')
      .populate('added_by')
      .populate('modified_by')
      .exec();
  }

  async create(clinicDto: ClinicDto, email: string) {
    const mongoUser = await this.userService.findByEmail(email);
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'clinic_number' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    if (counter) {
      const clinicData = {
        ...clinicDto,
        added_by: mongoUser._id,
        added_by_at: new Date(),
        number: `CL-${counter.value}`
      };
      return (await this.clinicModel.create(clinicData)).populate('branch');

    } else {
      throw new Error('Error generating branch number');
    }
  }

  async update(id: string, clinicDto: ClinicDto, email: string): Promise<Clinic> {
    const mongoUser = await this.userService.findByEmail(email);
    return await this.clinicModel.findByIdAndUpdate(
      id,
      {
        modified_by: mongoUser._id,
        modified_at: new Date(),
        ...clinicDto,
      },
    ).populate('branch')
      .exec();
  }

  async getClinicUsers(id: string, listUserDto: ListUserDto) {
    const clinic = await this.clinicModel.findById(id);
    if (!clinic) {
      throw new Error('Clinic not found');
    }
    return this.userService.findUsersByClinic(id, listUserDto);
  }

  async getClinicDoctors(id: string) {
    const clinic = await this.clinicModel.findById(id);
    if (!clinic) {
      throw new Error('Clinic not found');
    }
    return this.userService.findDoctorsByClinic(id);
  }
}
