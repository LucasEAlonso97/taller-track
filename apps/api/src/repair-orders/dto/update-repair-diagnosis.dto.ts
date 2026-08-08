import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateRepairDiagnosisDto {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  diagnosis!: string;

  @IsOptional()
  @IsDateString()
  estimatedCompletionDate?: string;
}