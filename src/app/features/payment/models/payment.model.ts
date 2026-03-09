import { PaymentMethod, PaymentStatus } from '../../../shared/models/enums.model';

export interface PaymentDTO {
  id: number;
  invoiceId: number;
  paymentMethod: PaymentMethod | string;
  externalReference: string;
  paymentDate: string;
  amount: number;
  status: PaymentStatus | string;
}

export interface ProcessPaymentRequestDTO {
  invoiceId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  externalReference?: string;
}

export interface ProcessMultiplePaymentsRequestDTO {
  invoiceId: number;
  payments: PaymentDTO[];
}

export interface UpdatePaymentStatusDTO {
  status: PaymentStatus;
}

export interface CreateMercadoPagoPreferenceDTO {
  invoiceId: number;
}

export interface MercadoPagoPreferenceResponseDTO {
  initPoint: string;
  invoiceId: number;
}

