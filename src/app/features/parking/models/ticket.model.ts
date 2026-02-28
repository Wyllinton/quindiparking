import { SessionStatus } from '../../../shared/models/enums.model';

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

