import { MembershipStatus } from '../../../shared/models/enums.model';

export interface MembershipDTO {
  id: number;
  userId: number;
  membershipPlanId: number;
  startDate: string;
  endDate: string;
  status: MembershipStatus | string;
  autoRenew: boolean;
}

export interface MembershipActiveCheckDTO {
  userId: number;
  checkedDate: string;
  activeMembership: boolean;
}

export interface DiscountDTO {
  userId: number;
  discountPercentage: number;
}

