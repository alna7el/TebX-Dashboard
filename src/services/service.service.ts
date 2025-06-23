import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Service } from "./schema/service.schema";
import { Model } from "mongoose";
import { PaginationDto } from "./dto/pagination.dto";
import { ServiceDto } from "./dto/service.dto";
import { UserService } from "src/users/user.service";

@Injectable()
export class ServiceService {
  constructor(@InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    private readonly userService: UserService
  ) { }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, perPage = 10, keyword } = paginationDto;
    const skip = (page - 1) * perPage;
    const query: any = {};
    if (keyword && keyword != "null") {
      query.$or = [
        { name_ar: { $regex: keyword, $options: 'i' } },
        { name_en: { $regex: keyword, $options: 'i' } },
        { sbs_code: { $regex: keyword, $options: 'i' } },
      ];
    }
    const [results, total] = await Promise.all([
      this.serviceModel.find(query).skip(skip).limit(perPage)
        .populate('added_by')
        .populate('modified_by')
        .sort({ createdAt: -1 })
        .exec(),
      this.serviceModel.countDocuments().exec(),
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

  async update(id: string, serviceDto: ServiceDto, email: string) {
    const mongoUser = await this.userService.findByEmail(email);
    return await this.serviceModel.findByIdAndUpdate(
      id, {
      ...serviceDto,
      modified_by: mongoUser._id.toString(),
      modified_at: new Date(),
    }, { new: true });
  }

  async create(serviceDto: ServiceDto, email: string): Promise<Service> {
    const mongoUser = await this.userService.findByEmail(email);
    const serviceData = {
      ...serviceDto,
      added_by: mongoUser._id.toString(),
      added_by_at: new Date()
    }
    return await this.serviceModel.create(serviceData);
  }

  async findById(id: string): Promise<Service> {
    return await this.serviceModel.findById(id)
      .populate('added_by')
      .populate('modified_by')
      .exec();
  }

  async changeStatus(id: string) {
    const document = await this.serviceModel.findById(id).exec();

    if (!document) {
      throw new NotFoundException('Document not found');
    }
    const status = document.status === 'active' ? 'non-active' : 'active';
    return await this.serviceModel.findByIdAndUpdate(id, {
      status
    }, {
      new: true
    }).exec();
  }

}