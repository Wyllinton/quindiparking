export interface InvoicePrintDTO {
  // Invoice id
  id: number;

  // Vehicle info
  licensePlate: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleColor: string;

  // Owner info (nullable if vehicle has no registered user)
  ownerName: string | null;
  ownerEmail: string | null;

  // Parking info
  parkingSpaceNumber: string;
  checkInTime: string;
  checkOutTime: string;
  totalMinutes: number;

  // Invoice amounts
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;

  // Invoice metadata
  issueDate: string;
  invoiceStatus: string;
  sessionStatus: string;
}
