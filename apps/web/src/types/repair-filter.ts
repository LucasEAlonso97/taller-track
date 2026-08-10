import type { RepairStatus } from './repair-order';

export type RepairFilter =
  | 'ALL'
  | RepairStatus
  | 'OVERDUE'
  | 'STALE';