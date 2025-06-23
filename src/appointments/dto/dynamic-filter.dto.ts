import { IsDateString, IsMongoId, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PaginationWithFiltersDto {
  @ApiProperty({
    description: 'Page number',
    example: '1',
    required: false
  })
  @IsString()
  @IsOptional()
  page: string;

  @ApiProperty({
    description: 'Number of items per page',
    example: '10',
    required: false
  })
  @IsString()
  @IsOptional()
  perPage: string;

  @ApiProperty({
    description: 'Filter by start date',
    example: '2024-03-20',
    required: false
  })
  @IsDateString()
  @IsOptional()
  from_date?: string;

  @ApiProperty({
    description: 'Filter by end date',
    example: '2024-03-25',
    required: false
  })
  @IsDateString()
  @IsOptional()
  to_date?: string;

  @ApiProperty({
    description: 'Filter by clinic ID',
    example: 'clinic_123',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  clinic?: string;

  @ApiProperty({
    description: 'Filter by doctor ID',
    example: 'doctor_456',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  doctor?: string;

  @ApiProperty({
    description: 'Filter by patient name (searches in both Arabic and English names)',
    example: 'John',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Filter by medical record number',
    example: 'MRN12345',
    required: false
  })
  @IsString()
  @IsOptional()
  medical_file_number?: string;

  @ApiProperty({
    description: 'Filter by appointment type',
    example: 'regular',
    required: false
  })
  @IsString()
  @IsOptional()
  appointment_type?: string;

  @ApiProperty({
    description: 'Filter by patient arrival time (format: HH:mm)',
    example: '14:30',
    required: false
  })
  @IsString()
  @IsOptional()
  patient_arrival_time?: string;

  @ApiProperty({
    description: 'Filter by appointment time (format: HH:mm)',
    example: '14:30',
    required: false
  })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiProperty({
    description: 'Filter by waiting list',
    example: 'true',
    required: false
  })
  @IsString()
  @IsOptional()
  is_waiting_list?: string;

  @ApiProperty({
    description: 'Filter by emergency',
    example: 'true',
    required: false
  })
  @IsString()
  @IsOptional()
  is_emergency?: string;


  @ApiProperty({
    description: 'Search keyword for patient names',
    example: 'John',
    required: false
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'date',
    required: false
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort direction (asc or desc)',
    example: 'desc',
    required: false
  })
  @IsString()
  @IsOptional()
  sortDirection?: string;
} 