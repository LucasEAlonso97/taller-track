import { IsEnum } from 'class-validator';
import { RepairStatus } from '../../generated/prisma/enums';

export class UpdateRepairStatusDto {
  @IsEnum(RepairStatus)
  status!: RepairStatus;
}