import { ServiceOrderStatus } from '../../../shared/models/enums.model';

export interface ServiceOrderDTO {
  id: number;
  parkingSessionId: number;
  detailingServiceId: number;
  requestedAt: string;
  completedAt?: string;
  status: ServiceOrderStatus | string;
  price: number;
}

export interface ServiceRequestDTO {
  parkingSessionId: number;
  detailingServiceId: number;
}

