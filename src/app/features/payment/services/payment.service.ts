import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { InvoiceDTO, UpdateInvoiceStatusDTO } from '../models/invoice.model';
import { InvoicePrintDTO } from '../models/invoice-print.model';
import { PaymentDTO, ProcessPaymentRequestDTO, ProcessMultiplePaymentsRequestDTO, UpdatePaymentStatusDTO, CreateMercadoPagoPreferenceDTO, MercadoPagoPreferenceResponseDTO, CompletePendingPaymentDTO } from '../models/payment.model';
import { InvoiceStatus, PaymentStatus, PaymentMethod } from '../../../shared/models/enums.model';
import { AmountDTO } from '../../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends ApiService {

  // ════════════════════════════════════════════
  //  INVOICES (Facturas)
  // ════════════════════════════════════════════

  createInvoice(invoice: InvoiceDTO): Observable<InvoiceDTO> {
    return this.post<InvoiceDTO>('/invoices', invoice);
  }

  getAllInvoices(status?: InvoiceStatus): Observable<InvoiceDTO[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.get<InvoiceDTO[]>('/invoices', params);
  }

  generateInvoiceFromSession(parkingSessionId: number): Observable<InvoiceDTO> {
    return this.post<InvoiceDTO>(`/invoices/generate-from-session/${parkingSessionId}`);
  }

  getInvoiceById(id: number): Observable<InvoiceDTO> {
    return this.get<InvoiceDTO>(`/invoices/${id}`);
  }

  deleteInvoice(id: number): Observable<void> {
    return this.delete<void>(`/invoices/${id}`);
  }

  getInvoiceBySessionId(parkingSessionId: number): Observable<InvoiceDTO> {
    return this.get<InvoiceDTO>(`/invoices/session/${parkingSessionId}`);
  }

  getInvoicesByUserId(userId: number): Observable<InvoiceDTO[]> {
    return this.get<InvoiceDTO[]>(`/invoices/user/${userId}`);
  }

  getInvoicesByDateRange(startDate: string, endDate: string): Observable<InvoiceDTO[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.get<InvoiceDTO[]>('/invoices/date-range', params);
  }

  calculateTotalAmount(parkingSessionId: number): Observable<AmountDTO> {
    return this.get<AmountDTO>(`/invoices/calculate/${parkingSessionId}`);
  }

  updateInvoiceStatus(id: number, dto: UpdateInvoiceStatusDTO): Observable<InvoiceDTO> {
    return this.patch<InvoiceDTO>(`/invoices/${id}/status`, dto);
  }

  getTotalRevenueByUser(userId: number): Observable<AmountDTO> {
    return this.get<AmountDTO>(`/invoices/revenue/${userId}`);
  }

  getInvoicePrint(invoiceId: number): Observable<InvoicePrintDTO> {
    return this.get<InvoicePrintDTO>(`/invoices/${invoiceId}/print`);
  }

  getAllInvoicesForPrint(status?: InvoiceStatus): Observable<InvoicePrintDTO[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.get<InvoicePrintDTO[]>('/invoices/print', params);
  }

  // ════════════════════════════════════════════
  //  PAYMENTS (Pagos)
  // ════════════════════════════════════════════

  createPayment(payment: PaymentDTO): Observable<PaymentDTO> {
    return this.post<PaymentDTO>('/payments', payment);
  }

  getAllPayments(status?: PaymentStatus, method?: PaymentMethod): Observable<PaymentDTO[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (method) {
      params = params.set('method', method);
    }
    return this.get<PaymentDTO[]>('/payments', params);
  }

  processPayment(request: ProcessPaymentRequestDTO): Observable<PaymentDTO> {
    return this.post<PaymentDTO>('/payments/process', request);
  }

  processMultiplePayments(request: ProcessMultiplePaymentsRequestDTO): Observable<PaymentDTO[]> {
    return this.post<PaymentDTO[]>('/payments/process-multiple', request);
  }

  getPaymentById(id: number): Observable<PaymentDTO> {
    return this.get<PaymentDTO>(`/payments/${id}`);
  }

  deletePayment(id: number): Observable<void> {
    return this.delete<void>(`/payments/${id}`);
  }

  getPaymentsByInvoiceId(invoiceId: number): Observable<PaymentDTO[]> {
    return this.get<PaymentDTO[]>(`/payments/invoice/${invoiceId}`);
  }

  getPaymentsByDateRange(startDate: string, endDate: string): Observable<PaymentDTO[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.get<PaymentDTO[]>('/payments/date-range', params);
  }

  calculateTotalPaidAmount(invoiceId: number): Observable<AmountDTO> {
    return this.get<AmountDTO>(`/payments/invoice/${invoiceId}/total-paid`);
  }

  calculatePendingAmount(invoiceId: number): Observable<AmountDTO> {
    return this.get<AmountDTO>(`/payments/invoice/${invoiceId}/pending`);
  }

  updatePaymentStatus(id: number, dto: UpdatePaymentStatusDTO): Observable<PaymentDTO> {
    return this.patch<PaymentDTO>(`/payments/${id}/status`, dto);
  }

  completePendingPayment(invoiceId: number, dto: CompletePendingPaymentDTO): Observable<PaymentDTO> {
    return this.post<PaymentDTO>(`/payments/invoice/${invoiceId}/complete`, dto);
  }

  // ════════════════════════════════════════════
  //  MERCADO PAGO
  // ════════════════════════════════════════════

  createMercadoPagoPreference(request: CreateMercadoPagoPreferenceDTO): Observable<MercadoPagoPreferenceResponseDTO> {
    return this.post<MercadoPagoPreferenceResponseDTO>('/payments/mercadopago/create-preference', request);
  }
}

