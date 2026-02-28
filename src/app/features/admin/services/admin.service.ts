import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ResponseDTO } from '../../../shared/models/api-response.model';
import {
  DashboardSummaryDTO,
  ParkingSpaceStatsDTO,
  ParkingSessionStatsDTO,
  MembershipStatsDTO,
  FinancialStatsDTO,
  RevenueReportDTO,
  SystemHealthDTO
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService extends ApiService {

  getDashboardSummary(): Observable<ResponseDTO<DashboardSummaryDTO>> {
    return this.get<ResponseDTO<DashboardSummaryDTO>>('/admin/dashboard/summary');
  }

  getParkingSpaceStats(): Observable<ResponseDTO<ParkingSpaceStatsDTO>> {
    return this.get<ResponseDTO<ParkingSpaceStatsDTO>>('/admin/dashboard/parking-spaces/stats');
  }

  getParkingSessionStats(): Observable<ResponseDTO<ParkingSessionStatsDTO>> {
    return this.get<ResponseDTO<ParkingSessionStatsDTO>>('/admin/dashboard/parking-sessions/stats');
  }

  getMembershipStats(): Observable<ResponseDTO<MembershipStatsDTO>> {
    return this.get<ResponseDTO<MembershipStatsDTO>>('/admin/dashboard/memberships/stats');
  }

  getFinancialStats(): Observable<ResponseDTO<FinancialStatsDTO>> {
    return this.get<ResponseDTO<FinancialStatsDTO>>('/admin/dashboard/financial/stats');
  }

  getRevenueReport(startDate: string, endDate: string): Observable<ResponseDTO<RevenueReportDTO>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.get<ResponseDTO<RevenueReportDTO>>('/admin/dashboard/financial/revenue-report', params);
  }

  getHealthStatus(): Observable<ResponseDTO<SystemHealthDTO>> {
    return this.get<ResponseDTO<SystemHealthDTO>>('/admin/dashboard/health');
  }
}

