import { ServiceOrderStatus } from '../../../shared/models/enums.model';

export interface DetailingServiceDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  estimatedDurationMinutes: number;
  status: ServiceOrderStatus | string;
}

export interface UpdateStatusDTO {
  status: ServiceOrderStatus;
}

