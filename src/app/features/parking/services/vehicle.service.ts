import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { VehicleDTO } from '../models/vehicle.model';
import { VehicleType } from '../../../shared/models/enums.model';
import { ExistsDTO } from '../../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService extends ApiService {

  // ──── CRUD ────

  createVehicle(vehicle: VehicleDTO): Observable<VehicleDTO> {
    return this.post<VehicleDTO>('/vehicles', vehicle);
  }

  getAllVehicles(): Observable<VehicleDTO[]> {
    return this.get<VehicleDTO[]>('/vehicles');
  }

  getVehicleById(id: number): Observable<VehicleDTO> {
    return this.get<VehicleDTO>(`/vehicles/${id}`);
  }

  updateVehicle(id: number, vehicle: VehicleDTO): Observable<VehicleDTO> {
    return this.put<VehicleDTO>(`/vehicles/${id}`, vehicle);
  }

  deleteVehicle(id: number): Observable<void> {
    return this.delete<void>(`/vehicles/${id}`);
  }

  // ──── Búsquedas ────

  getVehicleByLicensePlate(licensePlate: string): Observable<VehicleDTO> {
    return this.get<VehicleDTO>(`/vehicles/license-plate/${licensePlate}`);
  }

  getVehiclesByUserId(userId: number): Observable<VehicleDTO[]> {
    return this.get<VehicleDTO[]>(`/vehicles/user/${userId}`);
  }

  getVehiclesByType(vehicleType: VehicleType): Observable<VehicleDTO[]> {
    return this.get<VehicleDTO[]>(`/vehicles/type/${vehicleType}`);
  }

  // ──── Verificación ────

  existsByLicensePlate(licensePlate: string): Observable<ExistsDTO> {
    return this.get<ExistsDTO>(`/vehicles/check-plate/${licensePlate}`);
  }
}

