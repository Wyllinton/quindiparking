import { VehicleType } from '../../../shared/models/enums.model';

export interface VehicleDTO {
  id: number;
  userId: number;
  licensePlate: string;
  vehicleType: VehicleType | string;
  brand: string;
  color: string;
}

