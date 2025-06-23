import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Prescription } from "./schema/prescription.schema";
import { Model, PipelineStage } from "mongoose";
import { PaginationDto } from "./dto/pagination.dto";
import { UserService } from "src/users/user.service";
import { RoleService } from "src/roles/roles.service";

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel(Prescription.name) private prescriptionModel: Model<Prescription>,
    private readonly userService: UserService,
    private readonly roleService: RoleService
  ) { }

  private buildSearchQuery(keyword: string) {
    if (!keyword || keyword === 'null') return {};

    return {
      $or: [
        { 'patient.first_name_ar': { $regex: keyword, $options: 'i' } },
        { 'patient.first_name_en': { $regex: keyword, $options: 'i' } },
        { 'patient.last_name_en': { $regex: keyword, $options: 'i' } },
        { 'patient.last_name_ar': { $regex: keyword, $options: 'i' } },
        { 'patient.national_id': keyword },
        { 'patient.phone': keyword }
      ]
    };
  }

  private getBasePipeline(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patient',
        },
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'added_by',
          foreignField: '_id',
          as: 'added_by',
        },
      },
      { $unwind: { path: '$added_by', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'clinics',
          localField: 'clinic',
          foreignField: '_id',
          as: 'clinic',
        }
      },
      { $unwind: { path: '$clinic', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'clinic.users',
          foreignField: '_id',
          as: 'clinic_users',
        },
      },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointment',
          foreignField: '_id',
          as: 'appointment',
        }
      },
      { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } }
    ];
  }

  private async validateUserAndGetRole(email: string) {
    const userId = await this.userService.findByEmail(email);
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const user = await this.userService.findOne(userId._id.toString());
    const roles = await this.roleService.findAll();
    const doctorRole = roles.find(role => role.name === "Doctor");

    if (!doctorRole) {
      throw new UnauthorizedException('Doctor role not found');
    }

    return { user, userId, doctorRole };
  }

  private calculatePagination(page: number, perPage: number, total: number) {
    const skip = (page - 1) * perPage;
    const lastPage = Math.ceil(total / perPage);
    const from = total > 0 ? skip + 1 : 0;
    const to = Math.min(skip + perPage, total);

    return { skip, lastPage, from, to };
  }

  async findAll(paginationDto: PaginationDto, email: string) {
    const { user, userId, doctorRole } = await this.validateUserAndGetRole(email);

    const page = Number(paginationDto.page) || 1;
    const perPage = Number(paginationDto.perPage) || 10;
    const query: any = {};

    // Add doctor filter if user is a doctor
    if (user.role_id.name === doctorRole.name) {
      query['appointment.doctor'] = userId._id;
    }

    // Add search query if keyword exists
    Object.assign(query, this.buildSearchQuery(paginationDto.keyword));

    const basePipeline = this.getBasePipeline();
    const { skip } = this.calculatePagination(page, perPage, 0);

    const pipeline: PipelineStage[] = [
      ...basePipeline,
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: perPage },
    ];

    const countPipeline: PipelineStage[] = [
      ...basePipeline,
      { $match: query },
      { $count: 'total' }
    ];

    const [results, total] = await Promise.all([
      this.prescriptionModel.aggregate(pipeline).exec(),
      this.prescriptionModel.aggregate(countPipeline).exec(),
    ]);

    const totalCount = total[0]?.total || 0;
    const { lastPage, from, to } = this.calculatePagination(page, perPage, totalCount);

    return {
      from,
      to,
      total: totalCount,
      page,
      per_page: perPage,
      last_page: lastPage,
      results,
    };
  }

  async findById(id: string) {
    return await this.prescriptionModel.findById(id)
      .populate('patient')
      .populate('added_by')
      .populate('appointment')
      .populate('clinic')
      .exec()
  }
}