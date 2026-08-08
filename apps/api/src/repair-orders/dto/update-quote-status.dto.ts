import { IsIn } from 'class-validator';
import { QuoteStatus } from '../../generated/prisma/enums';

export class UpdateQuoteStatusDto {
  @IsIn([
    QuoteStatus.APPROVED,
    QuoteStatus.REJECTED,
  ])
  status!: QuoteStatus;
}