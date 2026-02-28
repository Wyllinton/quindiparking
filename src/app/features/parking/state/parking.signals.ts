import { signal } from '@angular/core';
import { ParkingSpaceDTO } from '../models/parking-space.model';

export const parkingSpaces = signal<ParkingSpaceDTO[]>([]);
export const parkingLoading = signal<boolean>(false);

