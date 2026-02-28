import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { DashboardSummaryDTO } from '../../models/dashboard.model';

@Component({
  selector: 'qp-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummaryDTO | null = null;
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading = true;
    this.adminService.getDashboardSummary().subscribe({
      next: (res) => {
        this.summary = res.content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

