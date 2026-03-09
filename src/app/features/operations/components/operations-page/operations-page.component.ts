import { Component } from '@angular/core';
import { ParkingService } from '../../../parking/services/parking.service';
import { VehicleService } from '../../../parking/services/vehicle.service';
import { PaymentService } from '../../../payment/services/payment.service';
import { ParkingSessionDTO } from '../../../parking/models/ticket.model';
import { CheckOutRequestDTO, CheckOutResponseDTO } from '../../../parking/models/ticket.model';
import { VehicleDTO, CreateVehicleWithoutUserDTO } from '../../../parking/models/vehicle.model';
import { VehicleType, PaymentMethod } from '../../../../shared/models/enums.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { InvoicePdfService } from '../../services/invoice-pdf.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'qp-operations-page',
  standalone: false,
  templateUrl: './operations-page.component.html',
  styleUrl: './operations-page.component.scss'
})
export class OperationsPageComponent {

  // ── Check-in ──
  checkInPlate = '';
  checkingIn = false;
  checkInResult: ParkingSessionDTO | null = null;

  // ── Vehicle registration (when not found) ──
  showRegisterForm = false;
  registerVehicleType: VehicleType = VehicleType.CAR;
  registerBrand = '';
  registerColor = '';
  registering = false;

  // Expose enum to template
  readonly VEHICLE_CAR = VehicleType.CAR;
  readonly VEHICLE_MOTO = VehicleType.MOTORCYCLE;

  // ── Check-out ──
  checkOutPlate = '';
  searchingSession = false;
  activeSession: ParkingSessionDTO | null = null;
  foundVehicle: VehicleDTO | null = null;
  selectedPaymentMethod: PaymentMethod | null = null;
  checkingOut = false;
  checkOutResult: CheckOutResponseDTO | null = null;
  downloadingPdf = false;

  paymentMethods = [
    { value: PaymentMethod.CASH, label: 'Efectivo', icon: '💵' },
    { value: PaymentMethod.TRANSFER, label: 'Transferencia', icon: '🏦' },
    { value: PaymentMethod.CARD, label: 'Tarjeta (Datáfono)', icon: '💳' },
    { value: PaymentMethod.MERCADO_PAGO, label: 'Mercado Pago', icon: '🌐' }
  ];

  constructor(
    private parkingService: ParkingService,
    private vehicleService: VehicleService,
    private paymentService: PaymentService,
    private invoicePdfService: InvoicePdfService,
    private notify: NotificationService
  ) {}

  // ════════════════════════════════════════
  //  CHECK-IN
  // ════════════════════════════════════════

  performCheckIn(): void {
    const plate = this.checkInPlate.trim().toUpperCase();
    if (!plate) return;
    this.checkingIn = true;
    this.checkInResult = null;
    this.showRegisterForm = false;
    this.parkingService.checkInByPlate({ licensePlate: plate }).subscribe({
      next: (session) => {
        this.checkInResult = session;
        this.checkingIn = false;
        this.notify.success('Entrada registrada — Espacio asignado automáticamente');
      },
      error: (err) => {
        this.checkingIn = false;
        const msg: string = err.error?.message || '';
        // Detect "vehicle not found" response (404)
        if (err.status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no encontrado')) {
          this.showRegisterForm = true;
          this.registerVehicleType = VehicleType.CAR;
          this.registerBrand = '';
          this.registerColor = '';
          this.notify.warning('Vehículo no registrado. Complete los datos para registrarlo.');
        } else {
          this.notify.error(msg || 'Error al registrar entrada');
        }
      }
    });
  }

  registerAndCheckIn(): void {
    const plate = this.checkInPlate.trim().toUpperCase();
    if (!plate) return;
    this.registering = true;

    const dto: CreateVehicleWithoutUserDTO = {
      licensePlate: plate,
      vehicleType: this.registerVehicleType,
      brand: this.registerBrand.trim() || undefined,
      color: this.registerColor.trim() || undefined
    };

    this.vehicleService.createVehicleWithoutUser(dto).pipe(
      switchMap(() => this.parkingService.checkInByPlate({ licensePlate: plate }))
    ).subscribe({
      next: (session) => {
        this.checkInResult = session;
        this.showRegisterForm = false;
        this.registering = false;
        this.notify.success('Vehículo registrado y entrada registrada exitosamente');
      },
      error: (err) => {
        this.registering = false;
        this.notify.error(err.error?.message || 'Error al registrar vehículo');
      }
    });
  }

  cancelRegister(): void {
    this.showRegisterForm = false;
  }

  clearCheckIn(): void {
    this.checkInPlate = '';
    this.checkInResult = null;
    this.showRegisterForm = false;
  }

  // ════════════════════════════════════════
  //  CHECK-OUT
  // ════════════════════════════════════════

  searchActiveSession(): void {
    const plate = this.checkOutPlate.trim().toUpperCase();
    if (!plate) return;
    this.searchingSession = true;
    this.activeSession = null;
    this.foundVehicle = null;
    this.checkOutResult = null;
    this.selectedPaymentMethod = null;

    this.vehicleService.getVehicleByLicensePlate(plate).pipe(
      switchMap(vehicle => {
        this.foundVehicle = vehicle;
        return this.parkingService.getActiveSessionByVehicleId(vehicle.id);
      })
    ).subscribe({
      next: (session) => {
        this.activeSession = session;
        this.searchingSession = false;
      },
      error: (err) => {
        this.searchingSession = false;
        this.notify.warning(err.error?.message || 'No se encontró sesión activa para esa placa');
      }
    });
  }

  selectPayment(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
  }

  performCheckOut(): void {
    if (!this.activeSession || !this.selectedPaymentMethod) return;
    this.checkingOut = true;

    const request: CheckOutRequestDTO = {
      paymentMethod: this.selectedPaymentMethod
    };

    this.parkingService.checkOut(this.activeSession.id, request).subscribe({
      next: (response) => {
        this.checkOutResult = response;
        this.checkingOut = false;
        this.activeSession = null;
        this.foundVehicle = null;

        if (response.sessionStatus === 'COMPLETED') {
          this.notify.success(`Salida registrada — Total: $${response.finalAmount.toLocaleString()}`);
        } else if (response.sessionStatus === 'PENDING_PAYMENT') {
          this.notify.warning(`Salida registrada — Pago pendiente. Total: $${response.finalAmount.toLocaleString()}`);
        } else {
          this.notify.info(`Salida registrada — Estado: ${response.sessionStatus}`);
        }
      },
      error: (err) => {
        this.checkingOut = false;
        this.notify.error(err.error?.message || 'Error al registrar salida');
      }
    });
  }


  downloadInvoicePdf(): void {
    if (!this.checkOutResult?.invoiceId) return;
    this.downloadingPdf = true;

    this.paymentService.getInvoicePrint(this.checkOutResult.invoiceId).subscribe({
      next: (printData) => {
        this.invoicePdfService.generate(printData);
        this.downloadingPdf = false;
        this.notify.success('Factura descargada exitosamente');
      },
      error: (err) => {
        this.downloadingPdf = false;
        this.notify.error(err.error?.message || 'Error al descargar la factura');
      }
    });
  }

  clearCheckOut(): void {
    this.checkOutPlate = '';
    this.activeSession = null;
    this.foundVehicle = null;
    this.checkOutResult = null;
    this.selectedPaymentMethod = null;
  }
}




