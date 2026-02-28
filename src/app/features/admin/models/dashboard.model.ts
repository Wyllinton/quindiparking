export interface DashboardSummaryDTO {
  availableSpaces: number;
  occupiedSpaces: number;
  occupancyRate: number;
  activeMemberships: number;
  timestamp: string;
}

export interface ParkingSpaceStatsDTO {
  availableSpaces: number;
  occupiedSpaces: number;
  totalSpaces: number;
  occupancyPercentage: number;
}

export interface ParkingSessionStatsDTO {
  totalSessions: number;
  sessionsLast30Days: number;
}

export interface MembershipStatsDTO {
  activeMemberships: number;
  totalMemberships: number;
  activationRate: number;
}

export interface FinancialStatsDTO {
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  totalRevenue: number;
}

export interface RevenueReportDTO {
  startDate: string;
  endDate: string;
  totalInvoiced: number;
  totalPaid: number;
  pendingAmount: number;
  invoiceCount: number;
  paymentCount: number;
}

export interface SystemHealthDTO {
  status: string;
  timestamp: string;
  message: string;
  database: string;
}

