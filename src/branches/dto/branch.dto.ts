import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  IsEnum
} from "class-validator";

enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export class BranchDto {
  @IsNotEmpty()
  @Matches(/^[\u0600-\u06FF\s]+$/, { message: "Name (Arabic) must contain only Arabic characters" })
  @MaxLength(50, { message: "Name (Arabic) must not exceed 50 characters" })
  readonly name_ar: string;

  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/, { message: "Name (English) must contain only English characters" })
  @MaxLength(50, { message: "Name (English) must not exceed 50 characters" })
  readonly name_en: string;

  @IsOptional()
  @Matches(/^966\d{9}$/, { message: "Mobile number must start with '966' followed by 9 digits" })
  readonly number: string;

  @IsNotEmpty()
  @IsString()
  readonly country: string;

  @IsNotEmpty()
  @IsString()
  readonly city: string;

  @IsOptional()
  @IsString()
  readonly district: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "Street must not exceed 100 characters" })
  readonly address: string;

  @IsOptional()
  @IsEnum(Status, { message: "Status must be either 'active' or 'inactive'" })
  readonly status: Status;

  @IsOptional()
  @Matches(/^https?:\/\/.+/, { message: "Image must be a valid URL" })
  readonly image: string;
}
