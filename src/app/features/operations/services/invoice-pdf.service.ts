import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { InvoicePrintDTO } from '../../payment/models/invoice-print.model';

@Injectable({
  providedIn: 'root'
})
export class InvoicePdfService {

  generate(data: InvoicePrintDTO): void {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const rightX = pageW - margin;
    let y = 25;

    // ═══════════════════════════════════════
    //  HEADER
    // ═══════════════════════════════════════
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text('QUINDIPARKING', pageW / 2, y, { align: 'center' });
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Sistema de Parqueadero', pageW / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(9);
    doc.text('NIT: 000.000.000-0', pageW / 2, y, { align: 'center' });
    y += 8;

    // Solid line
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.line(margin, y, rightX, y);
    y += 8;

    // ═══════════════════════════════════════
    //  FACTURA DE SERVICIO
    // ═══════════════════════════════════════
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(50, 50, 50);
    doc.text('FACTURA DE SERVICIO', pageW / 2, y, { align: 'center' });
    y += 9;

    y = this.addRow(doc, margin, rightX, y, 'Fecha de emisión', data.issueDate ? this.formatDateTime(data.issueDate) : '—');
    y = this.addRow(doc, margin, rightX, y, 'Estado factura', this.translateInvoiceStatus(data.invoiceStatus));
    y = this.addRow(doc, margin, rightX, y, 'Estado sesión', this.translateSessionStatus(data.sessionStatus));
    y += 4;
    y = this.addDottedLine(doc, margin, rightX, y);

    // ═══════════════════════════════════════
    //  DATOS DEL VEHÍCULO
    // ═══════════════════════════════════════
    y = this.addSectionTitle(doc, pageW, y, 'DATOS DEL VEHÍCULO');
    y = this.addRow(doc, margin, rightX, y, 'Placa', data.licensePlate || '—');
    y = this.addRow(doc, margin, rightX, y, 'Tipo', this.translateVehicleType(data.vehicleType));
    if (data.vehicleBrand) {
      y = this.addRow(doc, margin, rightX, y, 'Marca', data.vehicleBrand);
    }
    if (data.vehicleColor) {
      y = this.addRow(doc, margin, rightX, y, 'Color', data.vehicleColor);
    }

    // ═══════════════════════════════════════
    //  PROPIETARIO (optional)
    // ═══════════════════════════════════════
    if (data.ownerName || data.ownerEmail) {
      y += 4;
      y = this.addDottedLine(doc, margin, rightX, y);
      y = this.addSectionTitle(doc, pageW, y, 'PROPIETARIO');
      if (data.ownerName) {
        y = this.addRow(doc, margin, rightX, y, 'Nombre', data.ownerName);
      }
      if (data.ownerEmail) {
        y = this.addRow(doc, margin, rightX, y, 'Email', data.ownerEmail);
      }
    }

    y += 4;
    y = this.addDottedLine(doc, margin, rightX, y);

    // ═══════════════════════════════════════
    //  DETALLE DEL SERVICIO
    // ═══════════════════════════════════════
    y = this.addSectionTitle(doc, pageW, y, 'DETALLE DEL SERVICIO');
    y = this.addRow(doc, margin, rightX, y, 'Espacio', data.parkingSpaceNumber || '—');
    y = this.addRow(doc, margin, rightX, y, 'Entrada', data.checkInTime ? this.formatDateTime(data.checkInTime) : '—');
    y = this.addRow(doc, margin, rightX, y, 'Salida', data.checkOutTime ? this.formatDateTime(data.checkOutTime) : '—');
    y = this.addRow(doc, margin, rightX, y, 'Tiempo total', this.formatMinutes(data.totalMinutes));
    y += 4;
    y = this.addDottedLine(doc, margin, rightX, y);

    // ═══════════════════════════════════════
    //  RESUMEN DE COBRO
    // ═══════════════════════════════════════
    y = this.addSectionTitle(doc, pageW, y, 'RESUMEN DE COBRO');
    y = this.addRow(doc, margin, rightX, y, 'Subtotal', this.formatCurrency(data.subtotal));
    if (data.discount && data.discount > 0) {
      y = this.addRow(doc, margin, rightX, y, 'Descuento', '- ' + this.formatCurrency(data.discount), [39, 174, 96]);
    }
    if (data.tax && data.tax > 0) {
      y = this.addRow(doc, margin, rightX, y, 'Impuesto', this.formatCurrency(data.tax));
    }
    y += 3;

    // Solid line before total
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.line(margin, y, rightX, y);
    y += 8;

    // ─── TOTAL ───
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL', margin, y);
    doc.text(this.formatCurrency(data.totalAmount), rightX, y, { align: 'right' });
    y += 8;

    // Solid line after total
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.line(margin, y, rightX, y);
    y += 12;

    // ═══════════════════════════════════════
    //  FOOTER
    // ═══════════════════════════════════════
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('¡Gracias por usar QuindiParking!', pageW / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Conserve este comprobante', pageW / 2, y, { align: 'center' });

    // ─── Download ───
    const plate = (data.licensePlate || 'SIN_PLACA').replace(/\s/g, '');
    doc.save('factura_' + plate + '_' + this.timestamp() + '.pdf');
  }

  // ═══════════════════════════════════════
  //  LAYOUT HELPERS
  // ═══════════════════════════════════════

  private addSectionTitle(doc: jsPDF, pageW: number, y: number, title: string): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(title, pageW / 2, y, { align: 'center' });
    return y + 8;
  }

  private addRow(doc: jsPDF, leftX: number, rightX: number, y: number, label: string, value: string, valueColor?: number[]): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(label, leftX, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(valueColor ? valueColor[0] : 33, valueColor ? valueColor[1] : 33, valueColor ? valueColor[2] : 33);
    doc.text(value, rightX, y, { align: 'right' });
    return y + 6;
  }

  private addDottedLine(doc: jsPDF, leftX: number, rightX: number, y: number): number {
    doc.setDrawColor(190, 190, 190);
    doc.setLineWidth(0.15);
    const step = 2;
    for (let x = leftX; x < rightX; x += step * 2) {
      doc.line(x, y, Math.min(x + step, rightX), y);
    }
    return y + 8;
  }

  // ═══════════════════════════════════════
  //  FORMATTERS
  // ═══════════════════════════════════════

  private formatDateTime(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return iso;
    }
  }

  private formatCurrency(amount: number): string {
    if (amount == null) return '$0';
    return '$' + amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  private formatMinutes(min: number): string {
    if (!min && min !== 0) return '—';
    if (min < 60) return min + ' min';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? h + 'h ' + m + 'min' : h + 'h';
  }

  private timestamp(): string {
    const n = new Date();
    const pad = (v: number) => String(v).padStart(2, '0');
    return n.getFullYear() + pad(n.getMonth() + 1) + pad(n.getDate()) + '_' + pad(n.getHours()) + pad(n.getMinutes());
  }

  private translateVehicleType(type: string): string {
    const m: Record<string, string> = { CAR: 'Carro', MOTORCYCLE: 'Moto', ELECTRIC: 'Eléctrico' };
    return m[type] || type || '—';
  }

  private translateInvoiceStatus(s: string): string {
    const m: Record<string, string> = { PENDING: 'Pendiente', PAID: 'Pagada', CANCELLED: 'Cancelada' };
    return m[s] || s || '—';
  }

  private translateSessionStatus(s: string): string {
    const m: Record<string, string> = { ACTIVE: 'Activa', COMPLETED: 'Completada', PENDING_PAYMENT: 'Pago pendiente', CANCELLED: 'Cancelada' };
    return m[s] || s || '—';
  }
}
