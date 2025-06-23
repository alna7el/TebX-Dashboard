import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';
@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) { }

  async findAll() {
    return this.roleModel.find().exec();
  }

  async findById(id: string) {
    return this.roleModel.findOne({ _id: id }).exec();
  }
}