import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  type!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  brand!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  model!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  accessories?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  initialCondition?: string;

  @IsUUID()
  clientId!: string;
}