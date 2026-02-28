import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DetailingServiceDTO, UpdateStatusDTO } from '../models/detailing-service.model';
import { ServiceOrderDTO, ServiceRequestDTO } from '../models/work-order.model';
import { ServiceOrderStatus } from '../../../shared/models/enums.model';
import { AmountDTO } from '../../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DetailingService extends ApiService {

  // ════════════════════════════════════════════
  //  DETAILING SERVICES (Catálogo)
  // ════════════════════════════════════════════

  createDetailingService(service: DetailingServiceDTO): Observable<DetailingServiceDTO> {
    return this.post<DetailingServiceDTO>('/detailing-services', service);
  }

  getAllDetailingServices(status?: ServiceOrderStatus): Observable<DetailingServiceDTO[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.get<DetailingServiceDTO[]>('/detailing-services', params);
  }

  getDetailingServiceById(id: number): Observable<DetailingServiceDTO> {
    return this.get<DetailingServiceDTO>(`/detailing-services/${id}`);
  }

  updateDetailingService(id: number, service: DetailingServiceDTO): Observable<DetailingServiceDTO> {
    return this.put<DetailingServiceDTO>(`/detailing-services/${id}`, service);
  }

  deleteDetailingService(id: number): Observable<void> {
    return this.delete<void>(`/detailing-services/${id}`);
  }

  getDetailingServiceByName(name: string): Observable<DetailingServiceDTO> {
    return this.get<DetailingServiceDTO>(`/detailing-services/name/${name}`);
  }

  updateDetailingServiceStatus(id: number, dto: UpdateStatusDTO): Observable<DetailingServiceDTO> {
    return this.patch<DetailingServiceDTO>(`/detailing-services/${id}/status`, dto);
  }

  existsDetailingServiceById(id: number): Observable<boolean> {
    return this.get<boolean>(`/detailing-services/check/${id}`);
  }

  // ════════════════════════════════════════════
  //  SERVICE ORDERS (Órdenes de servicio)
  // ════════════════════════════════════════════

  createServiceOrder(order: ServiceOrderDTO): Observable<ServiceOrderDTO> {
    return this.post<ServiceOrderDTO>('/service-orders', order);
  }

  getAllServiceOrders(status?: ServiceOrderStatus): Observable<ServiceOrderDTO[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.get<ServiceOrderDTO[]>('/service-orders', params);
  }

  requestService(request: ServiceRequestDTO): Observable<ServiceOrderDTO> {
    return this.post<ServiceOrderDTO>('/service-orders/request', request);
  }

  completeService(serviceOrderId: number): Observable<ServiceOrderDTO> {
    return this.patch<ServiceOrderDTO>(`/service-orders/${serviceOrderId}/complete`);
  }

  getServiceOrderById(id: number): Observable<ServiceOrderDTO> {
    return this.get<ServiceOrderDTO>(`/service-orders/${id}`);
  }

  updateServiceOrder(id: number, order: ServiceOrderDTO): Observable<ServiceOrderDTO> {
    return this.put<ServiceOrderDTO>(`/service-orders/${id}`, order);
  }

  deleteServiceOrder(id: number): Observable<void> {
    return this.delete<void>(`/service-orders/${id}`);
  }

  getServiceOrdersByParkingSessionId(parkingSessionId: number): Observable<ServiceOrderDTO[]> {
    return this.get<ServiceOrderDTO[]>(`/service-orders/session/${parkingSessionId}`);
  }

  getServiceOrdersByDetailingServiceId(detailingServiceId: number): Observable<ServiceOrderDTO[]> {
    return this.get<ServiceOrderDTO[]>(`/service-orders/detailing-service/${detailingServiceId}`);
  }

  getServiceOrdersByDateRange(startDate: string, endDate: string): Observable<ServiceOrderDTO[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.get<ServiceOrderDTO[]>('/service-orders/date-range', params);
  }

  calculateTotalServiceCost(parkingSessionId: number): Observable<AmountDTO> {
    return this.get<AmountDTO>(`/service-orders/session/${parkingSessionId}/total-cost`);
  }

  updateServiceOrderStatus(id: number, dto: UpdateStatusDTO): Observable<ServiceOrderDTO> {
    return this.patch<ServiceOrderDTO>(`/service-orders/${id}/status`, dto);
  }
}

