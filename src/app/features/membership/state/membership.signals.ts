import { signal } from '@angular/core';
import { MembershipDTO } from '../models/membership.model';
import { MembershipPlanDTO } from '../models/membership-plan.model';

export const memberships = signal<MembershipDTO[]>([]);
export const membershipPlans = signal<MembershipPlanDTO[]>([]);
export const membershipLoading = signal<boolean>(false);

