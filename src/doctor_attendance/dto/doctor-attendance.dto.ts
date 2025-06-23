import { IsArray, IsMongoId, IsString } from "class-validator";
import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DoctorAttendanceDto {
  @ApiProperty({
    description: 'Array of doctor IDs',
    example: ["683c84903184c779bf9c5f83"],
    type: [String]
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty({ each: true })
  doctor: string[];

  @ApiProperty({
    description: 'Clinic ID',
    example: "68366f882b9a35d0da997857"
  })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  clinic: string;
}