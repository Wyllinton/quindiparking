import { MembershipStatus, PaymentMethod } from '../../../shared/models/enums.model';

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

export interface AdminCreateMembershipDTO {
  userId: number;
  membershipPlanId: number;
  paymentMethod: PaymentMethod | string;
  autoRenew: boolean;
}

export interface CheckoutMembershipDTO {
  membershipPlanId: number;
  autoRenew: boolean;
}

export interface MercadoPagoPreferenceResponseDTO {
  initPoint: string;
  invoiceId: number;
}
