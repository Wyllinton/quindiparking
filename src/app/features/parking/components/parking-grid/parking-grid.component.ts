import { Component, OnInit, OnDestroy } from '@angular/core';
import { ParkingService } from '../../services/parking.service';
import { VehicleService } from '../../services/vehicle.service';
import { ParkingSpaceDTO } from '../../models/parking-space.model';
import { ParkingSessionDTO, CheckInRequestDTO } from '../../models/ticket.model';
import { VehicleDTO } from '../../models/vehicle.model';
import { ParkingSpaceStatus } from '../../../../shared/models/enums.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-parking-grid',
  standalone: false,
  templateUrl: './parking-grid.component.html',
  styleUrl: './parking-grid.component.scss'
})
export class ParkingGridComponent implements OnInit, OnDestroy {
  spaces: ParkingSpaceDTO[] = [];
  loading = true;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  // Modal state
  selectedSpace: ParkingSpaceDTO | null = null;
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

  constructor(
    private parkingService: ParkingService,
    private vehicleService: VehicleService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadSpaces();
    this.intervalId = setInterval(() => this.loadSpaces(), 15000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadSpaces(): void {
    this.parkingService.getAllParkingSpaces().subscribe({
      next: (data) => { this.spaces = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
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

  onSlotClick(space: ParkingSpaceDTO): void {
    this.selectedSpace = space;
    this.resetModalState();

    switch (space.status) {
      case ParkingSpaceStatus.AVAILABLE:
      case 'AVAILABLE':
        this.modalMode = 'available';
        break;
      case ParkingSpaceStatus.OCCUPIED:
      case 'OCCUPIED':
        this.modalMode = 'occupied';
        this.loadActiveSession(space.id);
        break;
      case ParkingSpaceStatus.RESERVED:
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
    this.selectedSpace = null;
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
    if (!this.foundVehicle || !this.selectedSpace) return;
    if (this.selectedSpace.status !== 'AVAILABLE' && this.selectedSpace.status !== ParkingSpaceStatus.AVAILABLE) {
      this.notify.error('Este espacio no está disponible');
      return;
    }
    this.checkingIn = true;
    const req: CheckInRequestDTO = { vehicleId: this.foundVehicle.id, parkingSpaceId: this.selectedSpace.id };
    this.parkingService.checkIn(req).subscribe({
      next: () => {
        this.notify.success('Check-in registrado exitosamente');
        this.closeModal();
        this.loadSpaces();
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
    this.parkingService.checkOut(this.activeSession.id).subscribe({
      next: (session) => {
        this.notify.success(`Check-out exitoso. Total: $${session.finalAmount.toLocaleString()}`);
        this.closeModal();
        this.loadSpaces();
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

