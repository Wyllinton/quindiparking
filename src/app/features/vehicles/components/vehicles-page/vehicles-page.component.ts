import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TokenService } from '../../../../core/auth/services/token.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserDTO } from '../../../../core/auth/models/user.model';
import { UserService } from '../../../../shared/services/user.service';
import { VehicleType } from '../../../../shared/models/enums.model';
import {
  AssignVehicleToUserDTO,
  CreateVehicleWithoutUserDTO,
  VehicleDTO
} from '../../../parking/models/vehicle.model';
import { VehicleService } from '../../../parking/services/vehicle.service';

@Component({
  selector: 'qp-vehicles-page',
  standalone: false,
  templateUrl: './vehicles-page.component.html',
  styleUrl: './vehicles-page.component.scss'
})
export class VehiclesPageComponent implements OnInit {
  vehicles: VehicleDTO[] = [];
  users: UserDTO[] = [];

  loadingVehicles = true;
  loadingUsers = false;
  submittingCreate = false;
  submittingAssign = false;
  searchingPlate = false;

  searchPlate = '';
  searchedVehicle: VehicleDTO | null = null;

  readonly vehicleTypeOptions: VehicleType[] = [VehicleType.CAR, VehicleType.MOTORCYCLE];

  createForm: FormGroup;
  assignForm: FormGroup;

  private userRole = '';

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private userService: UserService,
    private tokenService: TokenService,
    private notify: NotificationService
  ) {
    this.createForm = this.fb.group({
      licensePlate: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]{5,10}$/)]],
      vehicleType: [VehicleType.CAR, Validators.required],
      brand: [''],
      color: ['']
    });

    this.assignForm = this.fb.group({
      vehicleId: [null, Validators.required],
      userId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.userRole = this.extractRole();
    this.loadVehicles();

    // Load users for ADMIN and OPERATOR roles
    if (this.canManageUsers) {
      this.loadUsers();
    }
  }

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  get canManageUsers(): boolean {
    return this.userRole === 'ADMIN' || this.userRole === 'OPERATOR';
  }

  loadVehicles(): void {
    this.loadingVehicles = true;
    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.loadingVehicles = false;
      },
      error: (err) => {
        this.loadingVehicles = false;
        this.notify.error(err.error?.message || 'No fue posible cargar los vehiculos');
      }
    });
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loadingUsers = false;
      },
      error: (err) => {
        this.loadingUsers = false;
        this.notify.warning(err.error?.message || 'No fue posible cargar usuarios para asignacion');
      }
    });
  }

  createVehicle(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.submittingCreate = true;
    const dto: CreateVehicleWithoutUserDTO = {
      licensePlate: String(this.createForm.value.licensePlate).trim().toUpperCase(),
      vehicleType: this.createForm.value.vehicleType,
      brand: String(this.createForm.value.brand || '').trim() || undefined,
      color: String(this.createForm.value.color || '').trim() || undefined
    };

    this.vehicleService.createVehicleWithoutUser(dto).subscribe({
      next: () => {
        this.submittingCreate = false;
        this.notify.success('Vehiculo creado correctamente');
        this.createForm.reset({ vehicleType: VehicleType.CAR, brand: '', color: '' });
        this.loadVehicles();
      },
      error: (err) => {
        this.submittingCreate = false;
        this.notify.error(err.error?.message || 'No fue posible crear el vehiculo');
      }
    });
  }

  searchByPlate(): void {
    const plate = this.searchPlate.trim().toUpperCase();
    this.searchedVehicle = null;

    if (!plate) {
      return;
    }

    this.searchingPlate = true;
    this.vehicleService.getVehicleByLicensePlate(plate).subscribe({
      next: (vehicle) => {
        this.searchingPlate = false;
        this.searchedVehicle = vehicle;
        this.assignForm.patchValue({ vehicleId: vehicle.id });
      },
      error: (err) => {
        this.searchingPlate = false;
        this.notify.warning(err.error?.message || 'No se encontro un vehiculo con esa placa');
      }
    });
  }

  prepareAssign(vehicle: VehicleDTO): void {
    this.assignForm.patchValue({ vehicleId: vehicle.id });
  }

  assignVehicleToUser(): void {
    if (this.assignForm.invalid) {
      console.warn('Assign form is invalid', {
        formValue: this.assignForm.value,
        formErrors: this.assignForm.errors,
        vehicleIdError: this.assignForm.get('vehicleId')?.errors,
        userIdError: this.assignForm.get('userId')?.errors
      });
      this.assignForm.markAllAsTouched();
      this.notify.warning('Por favor, ingresa el ID del vehículo y del usuario');
      return;
    }

    const dto: AssignVehicleToUserDTO = {
      vehicleId: Number(this.assignForm.value.vehicleId),
      userId: Number(this.assignForm.value.userId)
    };

    console.log('Sending assign vehicle request:', dto);
    this.submittingAssign = true;
    this.vehicleService.assignVehicleToUser(dto).subscribe({
      next: () => {
        this.submittingAssign = false;
        this.notify.success('Vehiculo asignado correctamente');
        this.assignForm.reset();
        this.searchedVehicle = null;
        this.loadVehicles();
      },
      error: (err) => {
        this.submittingAssign = false;
        console.error('Error assigning vehicle:', err);
        this.notify.error(err.error?.message || 'No fue posible asignar el vehiculo');
      }
    });
  }

  private extractRole(): string {
    const token = this.tokenService.getToken();
    if (!token) {
      console.warn('No token found');
      return '';
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Try multiple common role claim names
      const roleClaim = payload.role || payload.roles || payload.authority || payload.authorities || '';
      const role = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;

      // Clean up role name (remove "ROLE_" prefix if present)
      const cleanRole = typeof role === 'string' ? role.replace(/^ROLE_/, '') : '';
      console.log('Extracted role from token:', { original: roleClaim, cleaned: cleanRole });
      return cleanRole;
    } catch (error) {
      console.error('Error extracting role from token:', error);
      return '';
    }
  }
}
