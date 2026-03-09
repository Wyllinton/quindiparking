import { VehicleType } from '../../../shared/models/enums.model';

export interface VehicleDTO {
  id: number;
  userId: number;
  licensePlate: string;
  vehicleType: VehicleType | string;
  brand: string;
  color: string;
}

export interface CreateVehicleWithoutUserDTO {
  licensePlate: string;
  vehicleType: VehicleType;
  brand?: string;
  color?: string;
}

