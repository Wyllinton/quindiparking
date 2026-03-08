import { PaymentMethod, SessionStatus } from '../../../shared/models/enums.model';

export interface ParkingSessionDTO {
  id: number;
  vehicleId: number;
  parkingSpaceId: number;
  checkInTime: string;
  checkOutTime?: string;
  totalMinutes: number;
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: SessionStatus | string;
}

export interface CheckInRequestDTO {
  vehicleId: number;
  parkingSpaceId: number;
}

export interface CheckInByPlateRequestDTO {
  licensePlate: string;
}

export interface CheckOutRequestDTO {
  paymentMethod: PaymentMethod;
  externalReference?: string;
}

export interface CheckOutResponseDTO {
  sessionId: number;
  licensePlate: string;
  parkingSpaceNumber: string;
  checkInTime: string;
  checkOutTime: string;
  totalMinutes: number;
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  sessionStatus: string;
  invoiceId: number;
  invoiceStatus: string;
}

