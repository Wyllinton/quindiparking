import { signal } from '@angular/core';
import { ServiceOrderDTO } from '../models/work-order.model';

export const serviceOrders = signal<ServiceOrderDTO[]>([]);
export const detailingLoading = signal<boolean>(false);

