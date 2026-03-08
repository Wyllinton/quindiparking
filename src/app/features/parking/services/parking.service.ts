import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ParkingSpaceDTO, UpdateParkingSpaceStatusDTO, NonAvailableSpaceDTO, OccupancyStatsDTO } from '../models/parking-space.model';
import { ParkingSessionDTO, CheckInRequestDTO, CheckInByPlateRequestDTO, CheckOutRequestDTO, CheckOutResponseDTO } from '../models/ticket.model';
import { PendingPaymentInfoDTO } from '../models/pending-payment.model';
import { ParkingSpaceStatus, SessionStatus, VehicleType } from '../../../shared/models/enums.model';
import { CountDTO } from '../../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ParkingService extends ApiService {

  // ════════════════════════════════════════════
  //  PARKING SPACES
  // ════════════════════════════════════════════

  createParkingSpace(space: ParkingSpaceDTO): Observable<ParkingSpaceDTO> {
    return this.post<ParkingSpaceDTO>('/parking-spaces', space);
  }

  getAllParkingSpaces(status?: ParkingSpaceStatus): Observable<ParkingSpaceDTO[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.get<ParkingSpaceDTO[]>('/parking-spaces', params);
  }

  getParkingSpaceById(id: number): Observable<ParkingSpaceDTO> {
    return this.get<ParkingSpaceDTO>(`/parking-spaces/${id}`);
  }

  updateParkingSpace(id: number, space: ParkingSpaceDTO): Observable<ParkingSpaceDTO> {
    return this.put<ParkingSpaceDTO>(`/parking-spaces/${id}`, space);
  }

  deleteParkingSpace(id: number): Observable<void> {
    return this.delete<void>(`/parking-spaces/${id}`);
  }

  getParkingSpaceByNumber(spaceNumber: string): Observable<ParkingSpaceDTO> {
    return this.get<ParkingSpaceDTO>(`/parking-spaces/number/${spaceNumber}`);
  }

  getAvailableSpacesByVehicleType(vehicleType: VehicleType): Observable<ParkingSpaceDTO[]> {
    return this.get<ParkingSpaceDTO[]>(`/parking-spaces/available/${vehicleType}`);
  }

  updateSpaceStatus(id: number, dto: UpdateParkingSpaceStatusDTO): Observable<ParkingSpaceDTO> {
    return this.patch<ParkingSpaceDTO>(`/parking-spaces/${id}/status`, dto);
  }

  countAvailableSpaces(): Observable<CountDTO> {
    return this.get<CountDTO>('/parking-spaces/stats/available');
  }

  countOccupiedSpaces(): Observable<CountDTO> {
    return this.get<CountDTO>('/parking-spaces/stats/occupied');
  }

  getNonAvailableSpaces(): Observable<NonAvailableSpaceDTO[]> {
    return this.get<NonAvailableSpaceDTO[]>('/parking-spaces/non-available');
  }

  getOccupancyStats(): Observable<OccupancyStatsDTO[]> {
    return this.get<OccupancyStatsDTO[]>('/parking-spaces/stats/occupancy');
  }

  // ════════════════════════════════════════════
  //  PARKING SESSIONS
  // ════════════════════════════════════════════

  createParkingSession(session: ParkingSessionDTO): Observable<ParkingSessionDTO> {
    return this.post<ParkingSessionDTO>('/parking-sessions', session);
  }

  getAllParkingSessions(status?: SessionStatus): Observable<ParkingSessionDTO[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.get<ParkingSessionDTO[]>('/parking-sessions', params);
  }

  checkIn(request: CheckInRequestDTO): Observable<ParkingSessionDTO> {
    return this.post<ParkingSessionDTO>('/parking-sessions/checkin', request);
  }

  checkInByPlate(request: CheckInByPlateRequestDTO): Observable<ParkingSessionDTO> {
    return this.post<ParkingSessionDTO>('/parking-sessions/checkin', request);
  }

  checkOut(sessionId: number, request: CheckOutRequestDTO): Observable<CheckOutResponseDTO> {
    return this.post<CheckOutResponseDTO>(`/parking-sessions/checkout/${sessionId}`, request);
  }

  getParkingSessionById(id: number): Observable<ParkingSessionDTO> {
    return this.get<ParkingSessionDTO>(`/parking-sessions/${id}`);
  }

  deleteParkingSession(id: number): Observable<void> {
    return this.delete<void>(`/parking-sessions/${id}`);
  }

  getParkingSessionsByVehicleId(vehicleId: number): Observable<ParkingSessionDTO[]> {
    return this.get<ParkingSessionDTO[]>(`/parking-sessions/vehicle/${vehicleId}`);
  }

  getActiveSessionByVehicleId(vehicleId: number): Observable<ParkingSessionDTO> {
    return this.get<ParkingSessionDTO>(`/parking-sessions/vehicle/${vehicleId}/active`);
  }

  getActiveSessionByParkingSpaceId(parkingSpaceId: number): Observable<ParkingSessionDTO> {
    return this.get<ParkingSessionDTO>(`/parking-sessions/space/${parkingSpaceId}/active`);
  }

  getSessionsByDateRange(startDate: string, endDate: string): Observable<ParkingSessionDTO[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.get<ParkingSessionDTO[]>('/parking-sessions/date-range', params);
  }

  getPendingPaymentByPlate(licensePlate: string): Observable<PendingPaymentInfoDTO> {
    return this.get<PendingPaymentInfoDTO>(`/parking-sessions/pending/${licensePlate}`);
  }
}

