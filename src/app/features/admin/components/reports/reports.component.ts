import { Component } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { FinancialStatsDTO, RevenueReportDTO } from '../../models/dashboard.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  financialStats: FinancialStatsDTO | null = null;
  revenueReport: RevenueReportDTO | null = null;
  loadingStats = false;
  loadingReport = false;
  startDate = '';
  endDate = '';

  constructor(private adminService: AdminService, private notify: NotificationService) {
    const now = new Date();
    this.endDate = now.toISOString().slice(0, 10);
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    this.startDate = start.toISOString().slice(0, 10);
    this.loadFinancialStats();
  }

  loadFinancialStats(): void {
    this.loadingStats = true;
    this.adminService.getFinancialStats().subscribe({
      next: (res) => { this.financialStats = res.content; this.loadingStats = false; },
      error: () => { this.loadingStats = false; this.notify.error('Error al cargar estadísticas'); }
    });
  }

  loadRevenueReport(): void {
    if (!this.startDate || !this.endDate) return;
    this.loadingReport = true;
    const s = new Date(this.startDate).toISOString();
    const e = new Date(this.endDate + 'T23:59:59').toISOString();
    this.adminService.getRevenueReport(s, e).subscribe({
      next: (res) => { this.revenueReport = res.content; this.loadingReport = false; },
      error: () => { this.loadingReport = false; this.notify.error('Error al generar reporte'); }
    });
  }
}

