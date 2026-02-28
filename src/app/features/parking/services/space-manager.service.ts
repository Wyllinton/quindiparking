import { Injectable } from '@angular/core';
import { ParkingService } from './parking.service';
import { Observable } from 'rxjs';
import { ParkingSpaceDTO, UpdateParkingSpaceStatusDTO } from '../models/parking-space.model';
import { ParkingSpaceStatus, VehicleType } from '../../../shared/models/enums.model';

@Injectable({ providedIn: 'root' })
export class SpaceManagerService {
  constructor(private parkingService: ParkingService) {}

  getAvailableForType(vehicleType: VehicleType): Observable<ParkingSpaceDTO[]> {
    return this.parkingService.getAvailableSpacesByVehicleType(vehicleType);
  }

  markOutOfService(spaceId: number): Observable<ParkingSpaceDTO> {
    const dto: UpdateParkingSpaceStatusDTO = { status: ParkingSpaceStatus.OUT_OF_SERVICE };
    return this.parkingService.updateSpaceStatus(spaceId, dto);
  }

  markAvailable(spaceId: number): Observable<ParkingSpaceDTO> {
    const dto: UpdateParkingSpaceStatusDTO = { status: ParkingSpaceStatus.AVAILABLE };
    return this.parkingService.updateSpaceStatus(spaceId, dto);
  }
}

