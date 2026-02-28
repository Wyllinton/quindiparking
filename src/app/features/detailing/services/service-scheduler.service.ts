import { Injectable } from '@angular/core';
import { DetailingService } from './detailing.service';
import { Observable } from 'rxjs';
import { ServiceOrderDTO } from '../models/work-order.model';
import { ServiceOrderStatus } from '../../../shared/models/enums.model';
import { UpdateStatusDTO } from '../models/detailing-service.model';

@Injectable({ providedIn: 'root' })
export class ServiceSchedulerService {
  constructor(private detailingService: DetailingService) {}

  getPendingOrders(): Observable<ServiceOrderDTO[]> {
    return this.detailingService.getAllServiceOrders(ServiceOrderStatus.REQUESTED);
  }

  getInProgressOrders(): Observable<ServiceOrderDTO[]> {
    return this.detailingService.getAllServiceOrders(ServiceOrderStatus.IN_PROGRESS);
  }

  startService(orderId: number): Observable<ServiceOrderDTO> {
    const dto: UpdateStatusDTO = { status: ServiceOrderStatus.IN_PROGRESS };
    return this.detailingService.updateServiceOrderStatus(orderId, dto);
  }

  completeService(orderId: number): Observable<ServiceOrderDTO> {
    return this.detailingService.completeService(orderId);
  }
}

