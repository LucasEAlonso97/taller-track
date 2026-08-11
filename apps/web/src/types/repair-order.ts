import type { Device } from './device';

export type RepairStatus =
  | 'RECEIVED'
  | 'IN_DIAGNOSIS'
  | 'WAITING_APPROVAL'
  | 'IN_REPAIR'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'UNREPAIRED';

export type QuoteStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface RepairStatusHistory {
  id: string;
  status: RepairStatus;
  repairOrderId: string;
  createdAt: string;
}

export interface RepairQuote {
  id: string;
  amount: number;
  description: string | null;
  status: QuoteStatus;
  respondedAt: string | null;
  repairOrderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepairOrder {
  id: string;
  code: string;
  reportedIssue: string;
  diagnosis: string | null;
  status: RepairStatus;
  estimatedCompletionDate: string | null;
  deliveredAt: string | null;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
  trackingToken: string;
  internalNotes: RepairInternalNote[];

  device: Device;
  statusHistory: RepairStatusHistory[];
  quote: RepairQuote | null;
}

export interface CreateRepairOrderInput {
  deviceId: string;
  reportedIssue: string;
  estimatedCompletionDate?: string;
}

export interface RepairInternalNote {
  id: string;
  content: string;
  repairOrderId: string;
  createdAt: string;
}