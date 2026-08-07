import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRepairOrderDto {
  @IsUUID()
  deviceId!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reportedIssue!: string;

  @IsOptional()
  @IsDateString()
  estimatedCompletionDate?: string;
}