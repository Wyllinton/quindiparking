import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MembershipService } from '../../services/membership.service';
import { MembershipDTO } from '../../models/membership.model';
import { MembershipPlanDTO } from '../../models/membership-plan.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { RecordStatus } from '../../../../shared/models/enums.model';

@Component({
  selector: 'qp-membership-page',
  standalone: false,
  templateUrl: './membership-page.component.html',
  styleUrl: './membership-page.component.scss'
})
export class MembershipPageComponent implements OnInit {
  plans: MembershipPlanDTO[] = [];
  memberships: MembershipDTO[] = [];
  loadingPlans = true;
  loadingMemberships = true;

  showForm = false;
  submitting = false;
  form: FormGroup;

  showPlanForm = false;
  submittingPlan = false;
  editingPlanId: number | null = null;
  planForm: FormGroup;

  protected readonly RecordStatus = RecordStatus;

  constructor(
    private membershipService: MembershipService,
    private fb: FormBuilder,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      userId: [null, Validators.required],
      membershipPlanId: [null, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
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
    this.loadPlans();
    this.loadMemberships();
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
    const dto: MembershipDTO = {
      id: 0,
      userId: val.userId,
      membershipPlanId: val.membershipPlanId,
      startDate: new Date(val.startDate).toISOString(),
      endDate: new Date(val.endDate).toISOString(),
      status: 'ACTIVE',
      autoRenew: val.autoRenew
    };
    this.membershipService.createMembership(dto).subscribe({
      next: () => {
        this.notify.success('Membresia creada exitosamente');
        this.showForm = false;
        this.submitting = false;
        this.form.reset({ autoRenew: false });
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
