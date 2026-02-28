import { RecordStatus } from '../../../shared/models/enums.model';

export interface MembershipPlanDTO {
  id: number;
  name: string;
  description: string;
  monthlyFee: number;
  discountPercentage: number;
  durationInDays: number;
  status: RecordStatus | string;
}

export interface UpdateRecordStatusDTO {
  status: RecordStatus;
}

