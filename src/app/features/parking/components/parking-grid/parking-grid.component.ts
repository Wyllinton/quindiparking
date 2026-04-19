import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ParkingService } from '../../services/parking.service';
import { VehicleService } from '../../services/vehicle.service';
import { ParkingSpaceDTO, NonAvailableSpaceDTO, OccupancyStatsDTO } from '../../models/parking-space.model';
import { ParkingSessionDTO, CheckInRequestDTO, CheckOutRequestDTO } from '../../models/ticket.model';
import { VehicleDTO } from '../../models/vehicle.model';
import { PaymentMethod } from '../../../../shared/models/enums.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { TokenService } from '../../../../core/auth/services/token.service';
import { PaymentService } from '../../../payment/services/payment.service';
import { PendingPaymentInfoDTO } from '../../models/pending-payment.model';

export interface SlotView {
  id: number;
  spaceNumber: string;
  type: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
}

@Component({
  selector: 'qp-parking-grid',
  standalone: false,
  templateUrl: './parking-grid.component.html',
  styleUrl: './parking-grid.component.scss'
})
export class ParkingGridComponent implements OnInit, OnDestroy {
  carSlots: SlotView[] = [];
  motoSlots: SlotView[] = [];
  occupancyStats: OccupancyStatsDTO[] = [];
  loading = true;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  // Modal state
  selectedSlot: SlotView | null = null;
  showModal = false;
  modalMode: 'available' | 'occupied' | 'reserved' | 'oos' = 'available';

  // Check-in form
  licensePlate = '';
  foundVehicle: VehicleDTO | null = null;
  searchingVehicle = false;
  checkingIn = false;

  // Occupied modal
  activeSession: ParkingSessionDTO | null = null;
  loadingSession = false;
  checkingOut = false;

  // Role
  userRole = '';
  isStaff = false; // true for ADMIN or OPERATOR

  // Pending payment state
  pendingPlate = '';
  searchingPending = false;
  pendingPayment: PendingPaymentInfoDTO | null = null;
  pendingNotFound = false;
  creatingPreference = false;
  mpUnavailable = false;

  constructor(
    private parkingService: ParkingService,
    private vehicleService: VehicleService,
    private paymentService: PaymentService,
    private notify: NotificationService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.userRole = this.extractRole();
    this.isStaff = this.userRole === 'ADMIN' || this.userRole === 'OPERATOR';
    this.loadData();
    this.intervalId = setInterval(() => this.loadData(), 15000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadData(): void {
    forkJoin({
      allSpaces: this.parkingService.getAllParkingSpaces(),
      nonAvailable: this.parkingService.getNonAvailableSpaces(),
      stats: this.parkingService.getOccupancyStats()
    }).subscribe({
      next: ({ allSpaces, nonAvailable, stats }) => {
        this.occupancyStats = stats;
        this.buildSlotsFromBackend(allSpaces, nonAvailable);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private buildSlotsFromBackend(allSpaces: ParkingSpaceDTO[], nonAvailable: NonAvailableSpaceDTO[]): void {
    // Build a map of non-available statuses keyed by spaceNumber
    const statusMap = new Map<string, string>();
    nonAvailable.forEach(na => statusMap.set(na.spaceNumber, na.status));

    // Convert all backend spaces to SlotView
    const allSlots: SlotView[] = allSpaces.map(space => {
      const naStatus = statusMap.get(space.spaceNumber);
      return {
        id: space.id,
        spaceNumber: space.spaceNumber,
        type: space.vehicleTypeAllowed.toString(),
        status: naStatus
          ? naStatus as SlotView['status']
          : 'AVAILABLE'
      };
    });

    // Separate by vehicle type
    this.carSlots = allSlots
      .filter(s => s.type === 'CAR')
      .sort((a, b) => a.spaceNumber.localeCompare(b.spaceNumber, undefined, { numeric: true }));

    this.motoSlots = allSlots
      .filter(s => s.type === 'MOTORCYCLE')
      .sort((a, b) => a.spaceNumber.localeCompare(b.spaceNumber, undefined, { numeric: true }));
  }

  getStatsFor(type: string): OccupancyStatsDTO | undefined {
    return this.occupancyStats.find(s => s.vehicleType === type);
  }

  get carHalf(): number {
    return Math.ceil(this.carSlots.length / 2);
  }

  get motoHalf(): number {
    return Math.ceil(this.motoSlots.length / 2);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'slot--available';
      case 'OCCUPIED': return 'slot--occupied';
      case 'RESERVED': return 'slot--reserved';
      case 'OUT_OF_SERVICE': return 'slot--oos';
      default: return '';
    }
  }

  getSlotIcon(status: string, type: string): string {
    if (status === 'OUT_OF_SERVICE') return '⚠️';
    if (status === 'RESERVED') return '🔒';
    if (status === 'OCCUPIED') return type === 'CAR' ? '🚗' : '🏍️';
    return '🅿️';
  }

  onSlotClick(slot: SlotView): void {
    if (!this.isStaff) return; // Users can only view the map
    this.selectedSlot = slot;
    this.resetModalState();

    switch (slot.status) {
      case 'AVAILABLE':
        this.modalMode = 'available';
        break;
      case 'OCCUPIED':
        this.modalMode = 'occupied';
        this.loadActiveSession(slot.id);
        break;
      case 'RESERVED':
        this.modalMode = 'reserved';
        break;
      default:
        this.modalMode = 'oos';
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSlot = null;
    this.resetModalState();
  }

  // ── Check-in flow ──
  searchVehicle(): void {
    if (!this.licensePlate.trim()) return;
    this.searchingVehicle = true;
    this.foundVehicle = null;
    this.vehicleService.getVehicleByLicensePlate(this.licensePlate.trim().toUpperCase()).subscribe({
      next: (v) => { this.foundVehicle = v; this.searchingVehicle = false; },
      error: () => { this.searchingVehicle = false; this.notify.warning('Vehículo no encontrado'); }
    });
  }

  performCheckIn(): void {
    if (!this.foundVehicle || !this.selectedSlot) return;
    if (this.selectedSlot.status !== 'AVAILABLE') {
      this.notify.error('Este espacio no está disponible');
      return;
    }
    this.checkingIn = true;
    const req: CheckInRequestDTO = { vehicleId: this.foundVehicle.id, parkingSpaceId: this.selectedSlot.id };
    this.parkingService.checkIn(req).subscribe({
      next: () => {
        this.notify.success('Check-in registrado exitosamente');
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.checkingIn = false;
        this.notify.error(err.error?.message || 'Error al registrar check-in');
      }
    });
  }

  // ── Check-out flow ──
  loadActiveSession(spaceId: number): void {
    this.loadingSession = true;
    this.parkingService.getActiveSessionByParkingSpaceId(spaceId).subscribe({
      next: (s) => { this.activeSession = s; this.loadingSession = false; },
      error: () => { this.loadingSession = false; }
    });
  }

  performCheckOut(): void {
    if (!this.activeSession) return;
    this.checkingOut = true;
    const request: CheckOutRequestDTO = { paymentMethod: PaymentMethod.CASH };
    this.parkingService.checkOut(this.activeSession.id, request).subscribe({
      next: (response) => {
        this.notify.success(`Check-out exitoso. Total: $${response.finalAmount.toLocaleString()}`);
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.checkingOut = false;
        this.notify.error(err.error?.message || 'Error al registrar check-out');
      }
    });
  }

  private resetModalState(): void {
    this.licensePlate = '';
    this.foundVehicle = null;
    this.searchingVehicle = false;
    this.checkingIn = false;
    this.activeSession = null;
    this.loadingSession = false;
    this.checkingOut = false;
  }

  // ════════════════════════════════════════
  // USER PENDING PAYMENT
  // ════════════════════════════════════════

  searchPendingPayment(): void {
    const plate = this.pendingPlate.trim().toUpperCase();
    if (!plate) return;
    this.searchingPending = true;
    this.pendingPayment = null;
    this.pendingNotFound = false;

    this.parkingService.getPendingPaymentByPlate(plate).subscribe({
      next: (info) => {
        this.pendingPayment = info;
        this.searchingPending = false;
      },
      error: (err) => {
        this.searchingPending = false;
        if (err.status === 404) {
          this.pendingNotFound = true;
        } else {
          this.notify.error(err.error?.message || 'Error al consultar pagos pendientes');
        }
      }
    });
  }

  payWithMercadoPago(): void {
    if (!this.pendingPayment) return;
    this.creatingPreference = true;
    this.mpUnavailable = false;

    this.paymentService.createMercadoPagoPreference({ invoiceId: this.pendingPayment.invoiceId }).subscribe({
      next: (pref) => {
        this.creatingPreference = false;
        if (pref?.initPoint) {
          window.location.href = pref.initPoint;
        } else {
          // Backend still not integrated with MP API — show inline message
          this.mpUnavailable = true;
        }
      },
      error: () => {
        this.creatingPreference = false;
        this.mpUnavailable = true;
      }
    });
  }

  clearPendingSearch(): void {
    this.pendingPlate = '';
    this.pendingPayment = null;
    this.pendingNotFound = false;
    this.mpUnavailable = false;
  }

  translateVehicleType(type: string): string {
    const map: Record<string, string> = { CAR: 'Carro', MOTORCYCLE: 'Moto', ELECTRIC: 'Eléctrico' };
    return map[type] || type || '—';
  }

  formatCurrency(amount: number): string {
    if (amount == null) return '$0';
    return '$' + amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
