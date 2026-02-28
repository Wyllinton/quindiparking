import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MembershipService } from '../../services/membership.service';
import { MembershipDTO } from '../../models/membership.model';
import { MembershipPlanDTO } from '../../models/membership-plan.model';
import { NotificationService } from '../../../../core/services/notification.service';

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
  }

  ngOnInit(): void {
    this.loadPlans();
    this.loadMemberships();
  }

  loadPlans(): void {
    this.loadingPlans = true;
    this.membershipService.getAllMembershipPlans().subscribe({
      next: (data) => { this.plans = data; this.loadingPlans = false; },
      error: () => { this.loadingPlans = false; }
    });
  }

  loadMemberships(): void {
    this.loadingMemberships = true;
    this.membershipService.getAllMemberships().subscribe({
      next: (data) => { this.memberships = data; this.loadingMemberships = false; },
      error: () => { this.loadingMemberships = false; }
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
        this.notify.success('Membresía creada exitosamente');
        this.showForm = false;
        this.submitting = false;
        this.form.reset({ autoRenew: false });
        this.loadMemberships();
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err.error?.message || 'Error al crear membresía');
      }
    });
  }

  activate(id: number): void {
    this.membershipService.activateMembership(id).subscribe({
      next: () => { this.notify.success('Membresía activada'); this.loadMemberships(); },
      error: (err) => this.notify.error(err.error?.message || 'Error al activar')
    });
  }

  cancel(id: number): void {
    this.membershipService.cancelMembership(id).subscribe({
      next: () => { this.notify.success('Membresía cancelada'); this.loadMemberships(); },
      error: (err) => this.notify.error(err.error?.message || 'Error al cancelar')
    });
  }

  renew(id: number): void {
    this.membershipService.renewMembership(id).subscribe({
      next: () => { this.notify.success('Membresía renovada'); this.loadMemberships(); },
      error: (err) => this.notify.error(err.error?.message || 'Error al renovar')
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge--success';
      case 'EXPIRED': return 'badge--warning';
      case 'CANCELLED': return 'badge--danger';
      default: return 'badge--gray';
    }
  }
}

