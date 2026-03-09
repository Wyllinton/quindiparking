import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { DashboardSummaryDTO } from '../../models/dashboard.model';
import { ParkingService } from '../../../parking/services/parking.service';
import { OccupancyStatsDTO } from '../../../parking/models/parking-space.model';
import { TokenService } from '../../../../core/auth/services/token.service';

@Component({
  selector: 'qp-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummaryDTO | null = null;
  occupancyStats: OccupancyStatsDTO[] = [];
  loading = true;
  userRole = '';

  constructor(
    private adminService: AdminService,
    private parkingService: ParkingService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.userRole = this.extractRole();
    this.loadDashboard();
  }

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  private get relevantStats(): OccupancyStatsDTO[] {
    return this.occupancyStats.filter(s => s.vehicleType === 'CAR' || s.vehicleType === 'MOTORCYCLE');
  }

  get totalOccupied(): number {
    return this.relevantStats.reduce((sum, s) => sum + s.occupiedSpaces, 0);
  }

  get totalAvailable(): number {
    return this.relevantStats.reduce((sum, s) => sum + s.availableSpaces, 0);
  }

  get totalSpaces(): number {
    return this.relevantStats.reduce((sum, s) => sum + s.totalSpaces, 0);
  }

  get overallOccupancy(): number {
    return this.totalSpaces > 0 ? (this.totalOccupied / this.totalSpaces) * 100 : 0;
  }

  loadDashboard(): void {
    this.loading = true;
    if (this.isAdmin) {
      this.loadAdminSummary();
    } else {
      this.loadOperatorStats();
    }
  }

  private loadAdminSummary(): void {
    this.adminService.getDashboardSummary().subscribe({
      next: (res) => {
        this.summary = res.content;
        this.loading = false;
      },
      error: () => {
        // Fallback to operator stats if admin endpoint fails
        this.loadOperatorStats();
      }
    });
  }

  private loadOperatorStats(): void {
    this.parkingService.getOccupancyStats().subscribe({
      next: (stats) => {
        this.occupancyStats = stats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private extractRole(): string {
    const token = this.tokenService.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || payload.roles || '';
    } catch {
      return '';
    }
  }
}

