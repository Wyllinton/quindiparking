import { InvoiceStatus } from '../../../shared/models/enums.model';

export interface InvoiceDTO {
  id: number;
  userId: number;
  parkingSessionId: number;
  issueDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus | string;
}

export interface UpdateInvoiceStatusDTO {
  status: InvoiceStatus;
}

