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

export interface NonAvailableSpaceDTO {
  spaceNumber: string;
  status: string;
}

export interface OccupancyStatsDTO {
  vehicleType: string;
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  occupancyPercentage: number;
}

