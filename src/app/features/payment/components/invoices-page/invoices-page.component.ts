import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { InvoicePrintDTO } from '../../models/invoice-print.model';
import { InvoicePdfService } from '../../../operations/services/invoice-pdf.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InvoiceStatus, PaymentMethod } from '../../../../shared/models/enums.model';

type SortableKey = 'licensePlate' | 'issueDate' | 'totalAmount' | 'invoiceStatus' | 'parkingSpaceNumber' | 'totalMinutes';

// InvoicePrintDTO enriched with the id from InvoiceDTO
export interface InvoiceRow extends InvoicePrintDTO {
  id: number;
}

@Component({
  selector: 'qp-invoices-page',
  standalone: false,
  templateUrl: './invoices-page.component.html',
  styleUrl: './invoices-page.component.scss'
})
export class InvoicesPageComponent implements OnInit {
  invoices: InvoiceRow[] = [];
  filteredInvoices: InvoiceRow[] = [];
  loading = true;
  downloadingIndex: number | null = null;

  // Filters
  searchPlate = '';
  statusFilter: InvoiceStatus | '' = '';

  // Sorting
  sortColumn: SortableKey = 'issueDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Complete pending payment
  showCompleteModal = false;
  completingInvoice: InvoiceRow | null = null;
  completingPayment = false;

  readonly statusOptions: { value: InvoiceStatus | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: InvoiceStatus.PAID, label: 'Pagadas' },
    { value: InvoiceStatus.PENDING, label: 'Pendientes' },
    { value: InvoiceStatus.CANCELLED, label: 'Canceladas' }
  ];

  constructor(
    private paymentService: PaymentService,
    private invoicePdfService: InvoicePdfService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    const status = this.statusFilter || undefined;

    forkJoin({
      invoices: this.paymentService.getAllInvoices(status as InvoiceStatus),
      prints: this.paymentService.getAllInvoicesForPrint(status)
    }).subscribe({
      next: ({ invoices, prints }) => {
        // Merge: both lists come in the same order from the backend
        this.invoices = prints.map((p, i) => ({
          ...p,
          id: invoices[i]?.id ?? 0
        }));
        this.applyFilterAndSort();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify.error('Error al cargar facturas');
      }
    });
  }

  // ──── Filters & Sort ────

  onFilterChange(): void {
    this.loadInvoices();
  }

  onSearchPlate(): void {
    this.applyFilterAndSort();
  }

  toggleSort(column: SortableKey): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = column === 'issueDate' ? 'desc' : 'asc';
    }
    this.applyFilterAndSort();
  }

  getSortIcon(column: SortableKey): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  private applyFilterAndSort(): void {
    let result = [...this.invoices];

    // Filter by plate
    if (this.searchPlate.trim()) {
      const term = this.searchPlate.trim().toUpperCase();
      result = result.filter(i => i.licensePlate?.toUpperCase().includes(term));
    }

    // Sort
    result.sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      let cmp: number;
      if (typeof valA === 'number' && typeof valB === 'number') {
        cmp = valA - valB;
      } else {
        cmp = String(valA ?? '').localeCompare(String(valB ?? ''));
      }
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });

    this.filteredInvoices = result;
  }

  // ──── PDF ────

  downloadPdf(invoice: InvoiceRow, index: number): void {
    this.downloadingIndex = index;
    try {
      this.invoicePdfService.generate(invoice);
      this.notify.success('Factura descargada');
    } catch {
      this.notify.error('Error al generar PDF');
    } finally {
      this.downloadingIndex = null;
    }
  }

  // ──── Complete pending payment ────

  openCompleteModal(invoice: InvoiceRow): void {
    this.completingInvoice = invoice;
    this.completingPayment = false;
    this.showCompleteModal = true;
  }

  closeCompleteModal(): void {
    this.showCompleteModal = false;
    this.completingInvoice = null;
  }

  selectPaymentMethod(method: string): void {
    if (!this.completingInvoice || this.completingPayment) return;
    this.completingPayment = true;

    this.paymentService.completePendingPayment(this.completingInvoice.id, { paymentMethod: method as PaymentMethod }).subscribe({
      next: () => {
        this.notify.success('Pago completado exitosamente');
        this.completingPayment = false;
        this.closeCompleteModal();
        this.loadInvoices();
      },
      error: () => {
        this.notify.error('Error al completar el pago');
        this.completingPayment = false;
      }
    });
  }

  // ──── Helpers ────

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagada',
      CANCELLED: 'Cancelada'
    };
    return map[status] || status;
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      PAID: 'badge--success',
      PENDING: 'badge--warning',
      CANCELLED: 'badge--danger'
    };
    return map[status] || 'badge--info';
  }

  translateVehicleType(type: string): string {
    const map: Record<string, string> = {
      CAR: 'Carro',
      MOTORCYCLE: 'Moto',
      ELECTRIC: 'Eléctrico'
    };
    return map[type] || type || '—';
  }

  formatCurrency(amount: number): string {
    if (amount == null) return '$0';
    return '$' + amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
}
