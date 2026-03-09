import { VehicleType } from '../../../shared/models/enums.model';

export interface HourlyRateDTO {
  vehicleType: VehicleType;
  hourlyRate: number;
}

export interface UpdateHourlyRateDTO {
  vehicleType: VehicleType;
  hourlyRate: number;
}

export interface RateCardItem {
  vehicleType: VehicleType;
  label: string;
  icon: string;
  hourlyRate: number | null;
  saving: boolean;
}

