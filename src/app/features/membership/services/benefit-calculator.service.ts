import { Injectable } from '@angular/core';
import { MembershipService } from './membership.service';
import { Observable, map } from 'rxjs';
import { DiscountDTO } from '../models/membership.model';
import { MembershipPlanDTO } from '../models/membership-plan.model';

@Injectable({ providedIn: 'root' })
export class BenefitCalculatorService {
  constructor(private membershipService: MembershipService) {}

  getDiscountForUser(userId: number): Observable<number> {
    return this.membershipService.getDiscountPercentageByUserId(userId).pipe(
      map((dto: DiscountDTO) => dto.discountPercentage)
    );
  }

  getActivePlans(): Observable<MembershipPlanDTO[]> {
    return this.membershipService.getActiveMembershipPlans();
  }
}

