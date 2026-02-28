import { Component, OnInit } from '@angular/core';
import { DetailingService } from '../../services/detailing.service';
import { DetailingServiceDTO } from '../../models/detailing-service.model';
import { ServiceOrderDTO, ServiceRequestDTO } from '../../models/work-order.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-detailing-page',
  standalone: false,
  templateUrl: './detailing-page.component.html',
  styleUrl: './detailing-page.component.scss'
})
export class DetailingPageComponent implements OnInit {
  services: DetailingServiceDTO[] = [];
  orders: ServiceOrderDTO[] = [];
  loading = true;
  loadingOrders = true;

  // New order form
  showForm = false;
  parkingSessionId: number | null = null;
  selectedServiceId: number | null = null;
  submitting = false;

  constructor(private detailingService: DetailingService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadOrders();
  }

  loadServices(): void {
    this.detailingService.getAllDetailingServices().subscribe({
      next: (data) => { this.services = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.detailingService.getAllServiceOrders().subscribe({
      next: (data) => { this.orders = data; this.loadingOrders = false; },
      error: () => { this.loadingOrders = false; }
    });
  }

  requestOrder(): void {
    if (!this.parkingSessionId || !this.selectedServiceId) return;
    this.submitting = true;
    const req: ServiceRequestDTO = { parkingSessionId: this.parkingSessionId, detailingServiceId: this.selectedServiceId };
    this.detailingService.requestService(req).subscribe({
      next: () => {
        this.notify.success('Orden de servicio creada');
        this.showForm = false;
        this.parkingSessionId = null;
        this.selectedServiceId = null;
        this.submitting = false;
        this.loadOrders();
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err.error?.message || 'Error al crear orden');
      }
    });
  }

  completeOrder(orderId: number): void {
    this.detailingService.completeService(orderId).subscribe({
      next: () => {
        this.notify.success('Servicio completado');
        this.loadOrders();
      },
      error: (err) => this.notify.error(err.error?.message || 'Error al completar')
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'REQUESTED': return 'badge--info';
      case 'IN_PROGRESS': return 'badge--warning';
      case 'COMPLETED': return 'badge--success';
      case 'CANCELLED': return 'badge--danger';
      default: return 'badge--gray';
    }
  }
}

