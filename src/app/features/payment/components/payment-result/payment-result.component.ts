import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'qp-payment-result',
  standalone: false,
  templateUrl: './payment-result.component.html',
  styleUrl: './payment-result.component.scss'
})
export class PaymentResultComponent implements OnInit {
  status = '';
  paymentId = '';
  merchantOrderId = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'] || params['collection_status'] || '';
      this.paymentId = params['payment_id'] || '';
      this.merchantOrderId = params['merchant_order_id'] || '';
      this.loading = false;
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToOperations(): void {
    this.router.navigate(['/dashboard/operations']);
  }
}

