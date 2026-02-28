import { Injectable } from '@angular/core';
import { PaymentService } from '../../payment/services/payment.service';
import { Observable, map } from 'rxjs';
import { AmountDTO } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class TariffCalculatorService {
  constructor(private paymentService: PaymentService) {}

  calculateSessionTotal(parkingSessionId: number): Observable<number> {
    return this.paymentService.calculateTotalAmount(parkingSessionId).pipe(
      map((dto: AmountDTO) => dto.amount)
    );
  }
}

