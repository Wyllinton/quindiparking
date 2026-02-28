import { ParkingSpaceStatus, VehicleType } from '../../../shared/models/enums.model';

export interface ParkingSpaceDTO {
  id: number;
  spaceNumber: string;
  vehicleTypeAllowed: VehicleType | string;
  status: ParkingSpaceStatus | string;
  locationDescription: string;
}

export interface UpdateParkingSpaceStatusDTO {
  status: ParkingSpaceStatus;
}

