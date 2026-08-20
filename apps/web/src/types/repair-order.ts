import type { Device } from './device';
import type { UserRole } from './auth';

export interface TraceUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface RepairPhoto {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  repairOrderId: string;
  createdAt: string;
}

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

  changedById: string | null;
  changedBy: TraceUser | null;
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

  updatedById: string | null;
  respondedById: string | null;

  updatedBy: TraceUser | null;
  respondedBy: TraceUser | null;
}

export interface RepairInternalNote {
  id: string;
  content: string;
  repairOrderId: string;
  createdAt: string;

  createdById: string | null;
  createdBy: TraceUser | null;
}

export interface RepairOrder {
  id: string;
  code: string;
  reportedIssue: string;

  diagnosis: string | null;

  diagnosisUpdatedById: string | null;
  diagnosisUpdatedAt: string | null;
  diagnosisUpdatedBy: TraceUser | null;

  status: RepairStatus;

  estimatedCompletionDate: string | null;
  deliveredAt: string | null;

  deviceId: string;

  createdAt: string;
  updatedAt: string;

  trackingToken: string;

  device: Device;

  internalNotes: RepairInternalNote[];

  statusHistory: RepairStatusHistory[];

  quote: RepairQuote | null;

  photos: RepairPhoto[];
}

export interface CreateRepairOrderInput {
  deviceId: string;
  reportedIssue: string;
  estimatedCompletionDate?: string;
}