import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MembershipService } from '../../services/membership.service';
import { MembershipDTO, AdminCreateMembershipDTO } from '../../models/membership.model';
import { MembershipPlanDTO } from '../../models/membership-plan.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { RecordStatus, PaymentMethod } from '../../../../shared/models/enums.model';
import { UserService } from '../../../../shared/services/user.service';
import { UserDTO } from '../../../../core/auth/models/user.model';
import { TokenService } from '../../../../core/auth/services/token.service';

@Component({
  selector: 'qp-membership-page',
  standalone: false,
  templateUrl: './membership-page.component.html',
  styleUrl: './membership-page.component.scss'
})
export class MembershipPageComponent implements OnInit {
  plans: MembershipPlanDTO[] = [];
  memberships: MembershipDTO[] = [];
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  userSearchTerm: string = '';

  loadingPlans = true;
  loadingMemberships = true;
  loadingUsers = false;

  showForm = false;
  submitting = false;
  form: FormGroup;

  showPlanForm = false;
  submittingPlan = false;
  editingPlanId: number | null = null;
  planForm: FormGroup;

  isAdmin = false;
  showUserSearch = false;
  readonly paymentMethods = [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.TRANSFER];

  protected readonly RecordStatus = RecordStatus;

  constructor(
    private membershipService: MembershipService,
    private userService: UserService,
    private tokenService: TokenService,
    private fb: FormBuilder,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      userId: [null, Validators.required],
      membershipPlanId: [null, Validators.required],
      paymentMethod: [PaymentMethod.CARD, Validators.required],
      autoRenew: [false]
    });

    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      monthlyFee: [null, [Validators.required, Validators.min(1)]],
      discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      durationInDays: [30, [Validators.required, Validators.min(1)]],
      status: [RecordStatus.ACTIVE, Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkRole();
    this.loadPlans();
    this.loadMemberships();

    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  checkRole(): void {
    const token = this.tokenService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roleClaim = payload.role || payload.roles || payload.authority || payload.authorities || '';
        const role = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;
        const cleanRole = typeof role === 'string' ? role.replace(/^ROLE_/, '') : '';
        this.isAdmin = cleanRole === 'ADMIN';
      } catch (e) {}
    }
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
      }
    });
  }

  filterUsers(): void {
    if (!this.userSearchTerm || !this.userSearchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const term = this.userSearchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user =>
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.firstName && user.firstName.toLowerCase().includes(term)) ||
      (user.lastName && user.lastName.toLowerCase().includes(term))
    );
  }

  selectUser(id: number): void {
    this.form.patchValue({ userId: id });
    this.showUserSearch = false;
  }

  loadPlans(): void {
    this.loadingPlans = true;
    this.membershipService.getAllMembershipPlans().subscribe({
      next: (data) => {
        this.plans = data;
        this.loadingPlans = false;
      },
      error: () => {
        this.loadingPlans = false;
      }
    });
  }

  loadMemberships(): void {
    this.loadingMemberships = true;
    this.membershipService.getAllMemberships().subscribe({
      next: (data) => {
        this.memberships = data;
        this.loadingMemberships = false;
      },
      error: () => {
        this.loadingMemberships = false;
      }
    });
  }

  createMembership(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    const val = this.form.value;

    const dto: AdminCreateMembershipDTO = {
      userId: Number(val.userId),
      membershipPlanId: Number(val.membershipPlanId),
      paymentMethod: val.paymentMethod,
      autoRenew: val.autoRenew
    };

    this.membershipService.createMembershipAdmin(dto).subscribe({
      next: () => {
        this.notify.success('Membresia creada exitosamente');
        this.showForm = false;
        this.submitting = false;
        this.form.reset({ paymentMethod: PaymentMethod.CARD, autoRenew: false });
        this.loadMemberships();
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err.error?.message || 'Error al crear membresia');
      }
    });
  }

  togglePlanForm(): void {
    if (this.showPlanForm && this.editingPlanId !== null) {
      this.cancelPlanEdit();
      return;
    }
    this.showPlanForm = !this.showPlanForm;
    if (!this.showPlanForm) {
      this.resetPlanForm();
    }
  }

  editPlan(plan: MembershipPlanDTO): void {
    this.editingPlanId = plan.id;
    this.showPlanForm = true;
    this.planForm.patchValue({
      name: plan.name,
      description: plan.description,
      monthlyFee: plan.monthlyFee,
      discountPercentage: plan.discountPercentage,
      durationInDays: plan.durationInDays,
      status: plan.status
    });
  }

  cancelPlanEdit(): void {
    this.resetPlanForm();
    this.showPlanForm = false;
    this.editingPlanId = null;
  }

  savePlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.submittingPlan = true;
    const val = this.planForm.value;
    const dto: MembershipPlanDTO = {
      id: this.editingPlanId ?? 0,
      name: val.name,
      description: val.description,
      monthlyFee: Number(val.monthlyFee),
      discountPercentage: Number(val.discountPercentage),
      durationInDays: Number(val.durationInDays),
      status: val.status
    };

    const request$ = this.editingPlanId === null
      ? this.membershipService.createMembershipPlan(dto)
      : this.membershipService.updateMembershipPlan(this.editingPlanId, dto);

    request$.subscribe({
      next: () => {
        this.notify.success(this.editingPlanId === null ? 'Plan creado exitosamente' : 'Plan actualizado exitosamente');
        this.submittingPlan = false;
        this.cancelPlanEdit();
        this.loadPlans();
      },
      error: (err) => {
        this.submittingPlan = false;
        this.notify.error(err.error?.message || 'No fue posible guardar el plan');
      }
    });
  }

  deletePlan(id: number): void {
    if (!window.confirm('Esta accion eliminara el plan. Deseas continuar?')) {
      return;
    }

    this.membershipService.deleteMembershipPlan(id).subscribe({
      next: () => {
        this.notify.success('Plan eliminado');
        this.loadPlans();
      },
      error: (err) => this.notify.error(err.error?.message || 'No fue posible eliminar el plan')
    });
  }

  togglePlanStatus(plan: MembershipPlanDTO): void {
    const currentStatus = String(plan.status).toUpperCase();
    const nextStatus = currentStatus === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;

    this.membershipService.updateMembershipPlanStatus(plan.id, { status: nextStatus }).subscribe({
      next: () => {
        this.notify.success(`Plan ${nextStatus === RecordStatus.ACTIVE ? 'activado' : 'inactivado'}`);
        this.loadPlans();
      },
      error: (err) => this.notify.error(err.error?.message || 'No fue posible actualizar el estado del plan')
    });
  }

  activate(id: number): void {
    this.membershipService.activateMembership(id).subscribe({
      next: () => {
        this.notify.success('Membresia activada');
        this.loadMemberships();
      },
      error: (err) => this.notify.error(err.error?.message || 'Error al activar')
    });
  }

  cancel(id: number): void {
    this.membershipService.cancelMembership(id).subscribe({
      next: () => {
        this.notify.success('Membresia cancelada');
        this.loadMemberships();
      },
      error: (err) => this.notify.error(err.error?.message || 'Error al cancelar')
    });
  }

  renew(id: number): void {
    this.membershipService.renewMembership(id).subscribe({
      next: () => {
        this.notify.success('Membresia renovada');
        this.loadMemberships();
      },
      error: (err) => this.notify.error(err.error?.message || 'Error al renovar')
    });
  }

  getPlanStatusBadge(status: string): string {
    return String(status).toUpperCase() === RecordStatus.ACTIVE ? 'badge--success' : 'badge--gray';
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'badge--success';
      case 'EXPIRED':
        return 'badge--warning';
      case 'CANCELLED':
        return 'badge--danger';
      default:
        return 'badge--gray';
    }
  }

  private resetPlanForm(): void {
    this.planForm.reset({
      name: '',
      description: '',
      monthlyFee: null,
      discountPercentage: 0,
      durationInDays: 30,
      status: RecordStatus.ACTIVE
    });
    this.editingPlanId = null;
  }
}
