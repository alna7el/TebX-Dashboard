import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Service, ServiceSchema } from "./schema/service.schema";
import { ServiceController } from "./service.controller";
import { ServiceService } from "./service.service";
import { UsersModule } from "src/users/users.module";


@Module({
  imports: [MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]), UsersModule],
  controllers: [ServiceController],
  providers: [ServiceService]
})
export class ServiceModule { }