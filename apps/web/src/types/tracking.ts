import type {
  QuoteStatus,
  RepairStatus,
} from './repair-order';

export interface PublicTrackingHistory {
  status: RepairStatus;
  createdAt: string;
}

export interface PublicTrackingQuote {
  amount: number;
  description: string | null;
  status: QuoteStatus;
  respondedAt: string | null;
}

export interface PublicTrackingDevice {
  type: string;
  brand: string;
  model: string;
}

export interface PublicTrackingData {
  code: string;
  status: RepairStatus;
  reportedIssue: string;
  diagnosis: string | null;
  estimatedCompletionDate: string | null;
  createdAt: string;
  updatedAt: string;

  device: PublicTrackingDevice;
  quote: PublicTrackingQuote | null;
  statusHistory: PublicTrackingHistory[];
}