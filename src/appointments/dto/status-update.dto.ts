import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

export class StatusUpdateDto {

  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsEnum(['In-progress', 'No-show', 'Completed'])
  status: string;
}