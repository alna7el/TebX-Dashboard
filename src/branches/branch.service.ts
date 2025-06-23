import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { ProviderBranch } from './schema/branch.schema';
import { BranchDto } from './dto/branch.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UserService } from 'src/users/user.service';
import { ListUserDto } from 'src/users/dto/list-user.dto';
import { Counter } from 'src/counters/counters.schema';
@Injectable()
export class BranchService {
  constructor(@InjectModel(ProviderBranch.name) private readonly providerBranchModel: Model<ProviderBranch>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
    private userService: UserService
  ) { }

  async create(createBranch: BranchDto, email: string): Promise<ProviderBranch> {
    const mongoUser = await this.userService.findByEmail(email);
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'branch_number' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    if (counter) {
      const branchData = {
        ...createBranch,
        added_by: mongoUser._id.toString(),
        added_by_at: new Date(),
        number: `B-${counter.value}`
      };
      return await this.providerBranchModel.create(branchData);
    } else {
      throw new Error('Error generating branch number');
    }
  }
  async findAll(paginationDto: PaginationDto) {
    const page = parseInt(paginationDto.page as any, 10) || 1;
    const perPage = parseInt(paginationDto.perPage as any, 10) || 10;
    const { keyword } = paginationDto;
    const query: any = {};
    if (keyword && keyword != "null") {
      query.$or = [
        { name_ar: { $regex: keyword, $options: 'i' } },
        { name_en: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { status: { $regex: keyword, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * perPage;
    const resultPipeline: PipelineStage[] = [
      { $match: query },
      {
        $lookup: {
          from: 'clinics',
          localField: '_id',
          foreignField: 'branch',
          as: 'clinics'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'branch',
          as: 'users',
        },
      },
      {
        $addFields: {
          clinicCount: { $size: '$clinics' },
          userCount: { $size: '$users' },
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: perPage
      },
      {
        $project: {
          clinics: 0,
          users: 0,
        }
      },
    ];

    const [results, total] = await Promise.all([
      this.providerBranchModel.aggregate(resultPipeline)
        .exec(),
      this.providerBranchModel.countDocuments(query).exec()]);
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

  async findOne(id: string): Promise<ProviderBranch> {
    return this.providerBranchModel.findOne({ _id: id })
      .populate('image')
      .populate('added_by')
      .populate('modified_by')
      .populate('country')
      .populate('city')
      .exec();
  }

  async update(id: string, BranchDto: BranchDto, email: string): Promise<ProviderBranch> {
    const mongoUser = await this.userService.findByEmail(email);
    return await this.providerBranchModel.findByIdAndUpdate(
      id,
      {
        ...BranchDto,
        modified_by: mongoUser._id.toString(),
        modified_at: new Date(),
      },
    ).populate('image')
      .populate('added_by')
      .populate('modified_by')
      .populate('country')
      .populate('city')
      .exec();
  }

  async assignUser(id: string, user_id: string) {
    const branch = await this.providerBranchModel.findById(id);
    if (!branch) {
      throw new Error('Branch not found');
    }
    return await this.userService.assignBranchToUser(user_id, branch._id.toString())
  }

  async getBranchUsers(id: string, listUserDto: ListUserDto) {
    const branch = await this.providerBranchModel.findById(id);
    if (!branch) {
      throw new Error('Branch not found');
    }
    return this.userService.findUsersByBranch(id, listUserDto);
  }
}