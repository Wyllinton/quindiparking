import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ParkingService } from '../../services/parking.service';
import { VehicleService } from '../../services/vehicle.service';
import { NonAvailableSpaceDTO, OccupancyStatsDTO } from '../../models/parking-space.model';
import { ParkingSessionDTO, CheckInRequestDTO } from '../../models/ticket.model';
import { VehicleDTO } from '../../models/vehicle.model';
import { NotificationService } from '../../../../core/services/notification.service';

export interface SlotView {
  spaceNumber: string;
  type: 'CAR' | 'MOTORCYCLE';
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

  // For check-in we need real space id
  private allSpaces: { id: number; spaceNumber: string }[] = [];

  constructor(
    private parkingService: ParkingService,
    private vehicleService: VehicleService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.buildSlots();
    this.loadData();
    this.intervalId = setInterval(() => this.loadData(), 15000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private buildSlots(): void {
    this.carSlots = [];
    this.motoSlots = [];
    for (let i = 1; i <= 50; i++) {
      const num = i.toString().padStart(2, '0');
      this.carSlots.push({ spaceNumber: `C-${num}`, type: 'CAR', status: 'AVAILABLE' });
      this.motoSlots.push({ spaceNumber: `M-${num}`, type: 'MOTORCYCLE', status: 'AVAILABLE' });
    }
  }

  loadData(): void {
    forkJoin({
      nonAvailable: this.parkingService.getNonAvailableSpaces(),
      stats: this.parkingService.getOccupancyStats(),
      allSpaces: this.parkingService.getAllParkingSpaces()
    }).subscribe({
      next: ({ nonAvailable, stats, allSpaces }) => {
        this.allSpaces = allSpaces.map(s => ({ id: s.id, spaceNumber: s.spaceNumber }));
        this.occupancyStats = stats;
        this.applyStatuses(nonAvailable);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private applyStatuses(nonAvailable: NonAvailableSpaceDTO[]): void {
    // Reset all to available
    this.carSlots.forEach(s => s.status = 'AVAILABLE');
    this.motoSlots.forEach(s => s.status = 'AVAILABLE');

    const statusMap = new Map<string, string>();
    nonAvailable.forEach(na => statusMap.set(na.spaceNumber, na.status));

    for (const slot of [...this.carSlots, ...this.motoSlots]) {
      const st = statusMap.get(slot.spaceNumber);
      if (st) {
        slot.status = st as SlotView['status'];
      }
    }
  }

  getStatsFor(type: string): OccupancyStatsDTO | undefined {
    return this.occupancyStats.find(s => s.vehicleType === type);
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
    return type === 'CAR' ? '🅿️' : '🅿️';
  }

  onSlotClick(slot: SlotView): void {
    this.selectedSlot = slot;
    this.resetModalState();

    switch (slot.status) {
      case 'AVAILABLE':
        this.modalMode = 'available';
        break;
      case 'OCCUPIED':
        this.modalMode = 'occupied';
        this.loadActiveSession(slot.spaceNumber);
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
    const spaceInfo = this.allSpaces.find(s => s.spaceNumber === this.selectedSlot!.spaceNumber);
    if (!spaceInfo) {
      this.notify.error('No se encontró el espacio en el sistema');
      return;
    }
    this.checkingIn = true;
    const req: CheckInRequestDTO = { vehicleId: this.foundVehicle.id, parkingSpaceId: spaceInfo.id };
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
  loadActiveSession(spaceNumber: string): void {
    const spaceInfo = this.allSpaces.find(s => s.spaceNumber === spaceNumber);
    if (!spaceInfo) return;
    this.loadingSession = true;
    this.parkingService.getActiveSessionByParkingSpaceId(spaceInfo.id).subscribe({
      next: (s) => { this.activeSession = s; this.loadingSession = false; },
      error: () => { this.loadingSession = false; }
    });
  }

  performCheckOut(): void {
    if (!this.activeSession) return;
    this.checkingOut = true;
    this.parkingService.checkOut(this.activeSession.id).subscribe({
      next: (session) => {
        this.notify.success(`Check-out exitoso. Total: $${session.finalAmount.toLocaleString()}`);
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
}

