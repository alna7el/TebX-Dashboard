import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { createUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { ListUserDto } from './dto/list-user.dto';
import * as bcrypt from 'bcrypt';
import { Clinic } from 'src/clinics/schemas/clinic.schema';
import { RoleService } from 'src/roles/roles.service';
import { AppointmentService } from 'src/appointments/appointment.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Clinic.name) private readonly clinicModel: Model<Clinic>,
    private readonly roleService: RoleService,
    private readonly appointmentService: AppointmentService
  ) { }

  async create(createUserDto: createUserDto, email: string): Promise<User> {
    const mongoUser = await this.findByEmail(email);
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const userData = {
      ...createUserDto,
      added_by: mongoUser._id.toString(),
      added_by_at: new Date()
    }
    const user = await this.userModel.create(userData);

    await this.assignBranchToUser(user._id.toString(), createUserDto.branch);

    if (createUserDto.clinics && createUserDto.clinics.length > 0) {
      for (const clinic of createUserDto.clinics) {
        await this.assignClinicToUser(user._id.toString(), clinic, createUserDto.branch);
      }
    }

    return user;
  }

  async findAll(ListUserDto: ListUserDto) {
    const { page = 1, perPage = 10, keyword, role_id,
      last_active_from, last_active_to, created_at_from,
      created_at_to, status, branch } = ListUserDto;
    const skip = (page - 1) * perPage;
    const query: any = {};
    if (keyword && keyword != "null") {
      const terms = keyword.trim().split(/\s+/).map(term =>
        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      );
      query.$and = terms.map(term => ({
        $or: [
          { firstName: { $regex: term, $options: 'i' } },
          { firstNameAR: { $regex: term, $options: 'i' } },
          { lastName: { $regex: term, $options: 'i' } },
          { lastNameAR: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
          { phone: { $regex: term, $options: 'i' } },
          { status: { $regex: term, $options: 'i' } }
        ]
      }));
    }

    if (role_id && role_id != "null") {
      query.role_id = role_id;
    }

    if (branch && branch != "null") {
      query.branch = branch;
    }

    if (status && status != "null") {
      query.status = status;
    }


    if (last_active_from || last_active_to) {
      query.last_active = {};
      if (last_active_from) {
        const startDate = new Date(last_active_from);
        startDate.setHours(0, 0, 0, 0);
        query.last_active.$gte = startDate;
      }
      if (last_active_to) {
        const endDate = new Date(last_active_to);
        endDate.setHours(23, 59, 59)
        query.last_active.$lte = endDate;
      }
    }

    if (created_at_from || created_at_to) {
      query.createdAt = {};
      if (created_at_from) {
        const startDate = new Date(created_at_from);
        startDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = startDate;
      }
      if (created_at_to) {
        const endDate = new Date(created_at_to);
        endDate.setHours(23, 59, 59)
        query.createdAt.$lte = endDate;
      }
    }

    const [results, total] = await Promise.all([
      this.userModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip).limit(perPage)
        .populate('role_id')
        .populate('clinics')
        .populate('branch')
        .populate('speciality')
        .populate('added_by')
        .populate('modified_by')
        .exec(),
      this.userModel.countDocuments(query).exec(),
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

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id })
      .populate('speciality')
      .populate('added_by')
      .populate('modified_by')
      .populate('role_id')
      .populate('branch')
      .populate('clinics')
      .exec();
  }

  async updateUserActivity(email: string) {
    await this.userModel.findOneAndUpdate({ email }, { last_active: new Date() }).exec();
  }

  async findByEmail(email: string) {
    const mongoUser = await this.userModel.findOne({ email }).select('_id');
    if (!mongoUser) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return mongoUser;
  }

  async changePassword(authUser: any, password: string) {
    password = await bcrypt.hash(password, 10)
    return await this.userModel.findByIdAndUpdate(
      authUser._id, {
      password
    }
    );

  }

  async update(id: string, createUserDto: createUserDto, email: string) {
    const mongoUser = await this.findByEmail(email);
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id, {
      ...createUserDto,
      modified_by: mongoUser._id.toString(),
      modified_at: new Date(),
    }, { new: true })
      .populate('speciality')
      .populate('added_by')
      .populate('modified_by')
      .populate('role_id')
      .populate('branch')
      .populate('clinics')
      .exec();

    if (createUserDto.branch) {
      await this.assignBranchToUser(id, createUserDto.branch);
    }
    if (createUserDto.clinics && createUserDto.clinics.length > 0) {
      const user = await this.userModel.findById(id);
      if (user.clinics) {
        for (const clinic of user.clinics) {
          await this.removeClinicFromUser(id, clinic.toString());
        }
      }
      for (const clinic of createUserDto.clinics) {
        await this.assignClinicToUser(id, clinic, createUserDto.branch);
      }
    }

    return updatedUser;
  }

  async findUsersByBranch(branch: string, listUserDto: ListUserDto) {
    const { page = 1, perPage = 10, keyword, role_id } = listUserDto;
    const branchId = new mongoose.Types.ObjectId(branch);
    const query: any = { branch: branchId };
    if (keyword && keyword != "null") {
      query.$or = [
        { firstName: { $regex: keyword, $options: 'i' } },
        { firstNameAR: { $regex: keyword, $options: 'i' } },
        { lastName: { $regex: keyword, $options: 'i' } },
        { lastNameAR: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { status: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (role_id && role_id != "null") {
      query.role_id = role_id;
    }
    const skip = (page - 1) * perPage;
    const [results, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(perPage)
        .populate('role_id')
        .populate('branch')
        .populate('speciality')
        .exec(),
      this.userModel.countDocuments(query).exec(),
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

  async assignBranchToUser(userId: string, branch: string) {
    return await this.userModel.findByIdAndUpdate(
      userId, {
      branch
    });
  }

  async removeBranchFromUser(userId: string) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { branch: null },
      { new: true }
    );
  }

  async removeClinicFromUser(userId: string, clinicId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { clinics: clinicId } },
      { new: true }
    ).exec();

    await this.clinicModel.findByIdAndUpdate(
      clinicId,
      { $pull: { users: userId } },
      { new: true }
    ).exec();

    return updatedUser;
  }

  async assignClinicToUser(userId: string, clinic: string, branch: string) {
    const user = await this.userModel.findById(userId).populate('role_id').exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: { clinics: clinic },
        branch: branch
      },
      { new: true }
    ).exec();
    await this.clinicModel.findByIdAndUpdate(
      clinic,
      { $addToSet: { users: userId } },
      { new: true }
    ).exec();

    return updatedUser;
  }

  async findUsersByClinic(clinic: string, listUserDto: ListUserDto) {
    const { page = 1, perPage = 10, keyword, role_id, speciality_id } = listUserDto;
    const clinicId = new mongoose.Types.ObjectId(clinic);
    const query: any = { clinics: clinicId };
    if (keyword && keyword != "null") {
      query.$or = [
        { firstName: { $regex: keyword, $options: 'i' } },
        { firstNameAR: { $regex: keyword, $options: 'i' } },
        { lastName: { $regex: keyword, $options: 'i' } },
        { lastNameAR: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { status: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (role_id && role_id != "null") {
      query.role_id = role_id;
    }
    if (speciality_id && speciality_id != "null") {
      query.speciality = speciality_id;
    }

    const skip = (page - 1) * perPage;
    const [results, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(perPage)
        .populate('role_id')
        .populate('branch')
        .populate('clinics')
        .populate('speciality')
        .exec(),
      this.userModel.countDocuments(query).exec(),
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

  async findDoctorsByClinic(clinic: string) {
    const clinicId = new mongoose.Types.ObjectId(clinic);
    const roles = await this.roleService.findAll();
    const doctorRole = roles.find(role => role.name === "Doctor");

    if (!doctorRole) {
      throw new Error('Doctor role not found');
    }
    const query = {
      clinics: clinicId,
      role_id: new mongoose.Types.ObjectId(doctorRole._id),
    };

    return this.userModel.find(query).exec();

  }

  private addWorkDays(createUserDto: createUserDto) {
    if (createUserDto.work_schedule) {
      createUserDto.work_schedule.forEach((schedule) => {
        if (!schedule.day || !Array.isArray(schedule.slots)) {
          throw new Error('Invalid work_schedule format.');
        }
        schedule.slots.forEach((slot) => {
          const startTime = new Date(`1970-01-01T${slot.start_time}:00Z`);
          const endTime = new Date(`1970-01-01T${slot.end_time}:00Z`);
          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new Error(`Invalid time format in schedule for day ${schedule.day}`);
          }
          const diffInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          if (diffInMinutes < 30) {
            throw new Error(
              `Time interval between ${slot.start_time} and ${slot.end_time} on ${schedule.day} should be at least 30 minutes.`
            );
          }
        });
      });
    }
  }


}