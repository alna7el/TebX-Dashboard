import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { ProviderBranch, ProviderBranchSchema } from './schema/branch.schema';
import { UsersModule } from 'src/users/users.module';
import { Counter, CounterSchema } from 'src/counters/counters.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: ProviderBranch.name, schema: ProviderBranchSchema },
    { name: Counter.name, schema: CounterSchema },

  ]), UsersModule],
  controllers: [BranchController],
  providers: [BranchService],
})
export class ProviderBranchModule { }