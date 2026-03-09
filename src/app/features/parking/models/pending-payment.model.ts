export interface PendingPaymentInfoDTO {
  licensePlate: string;
  vehicleType: string;
  checkInTime: string;
  checkOutTime: string;
  totalMinutes: number;
  totalAmount: number;
  pendingAmount: number;
  invoiceId: number;
  paymentId: number;
}

