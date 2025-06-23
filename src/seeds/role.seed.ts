// seed/role.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../roles/schemas/role.schema';

@Injectable()
export class RoleSeeder {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) { }

  async createRoles() {
    const roles = [
      { name: 'Admin' },
      { name: 'Doctor' },
      { name: 'practitioner' },
    ];

    for (const role of roles) {
      const existingRole = await this.roleModel.findOne({ name: role.name });
      if (!existingRole) {
        await this.roleModel.create(role);
        Logger.log(`Role ${role.name} seeded successfully.`);
      } else {
        Logger.log(`Role ${role.name} already exists.`);
      }
    }
  }
}
