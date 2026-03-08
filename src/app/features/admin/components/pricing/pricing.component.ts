import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { HourlyRateDTO, RateCardItem } from '../../models/pricing.model';
import { VehicleType } from '../../../../shared/models/enums.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'qp-pricing',
  standalone: false,
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent implements OnInit {

  private readonly apiUrl = environment.apiUrl;

  rates: RateCardItem[] = [
    { vehicleType: VehicleType.CAR, label: 'Carro', icon: '🚗', hourlyRate: null, saving: false },
    { vehicleType: VehicleType.MOTORCYCLE, label: 'Moto', icon: '🏍️', hourlyRate: null, saving: false }
  ];

  loading = true;

  constructor(
    private http: HttpClient,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadRates();
  }

  loadRates(): void {
    this.loading = true;
    this.http.get<HourlyRateDTO[]>(`${this.apiUrl}/parking-spaces/rates`).subscribe({
      next: (data) => {
        for (const dto of data) {
          const card = this.rates.find(r => r.vehicleType === dto.vehicleType);
          if (card) {
            card.hourlyRate = dto.hourlyRate;
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify.error('Error al cargar las tarifas actuales');
      }
    });
  }

  saveRate(rate: RateCardItem): void {
    if (rate.hourlyRate == null || rate.hourlyRate <= 0) {
      this.notify.warning('La tarifa debe ser mayor a 0');
      return;
    }

    rate.saving = true;

    const body = {
      vehicleType: rate.vehicleType,
      hourlyRate: rate.hourlyRate
    };

    this.http.patch<any>(`${this.apiUrl}/parking-spaces/rate`, body).subscribe({
      next: (res) => {
        rate.saving = false;
        this.notify.success(res?.content ?? `Tarifa de ${rate.label} actualizada correctamente`);
      },
      error: (err: HttpErrorResponse) => {
        rate.saving = false;
        const msg = err.error?.message || err.error?.content || err.message || 'Error desconocido';
        this.notify.error(`Error: ${msg}`);
        console.error('PATCH /parking-spaces/rate failed:', err);
      }
    });
  }
}

