import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { PaymentResultComponent } from './components/payment-result/payment-result.component';

@NgModule({
  declarations: [PaymentResultComponent],
  imports: [SharedModule],
  exports: [PaymentResultComponent]
})
export class PaymentModule {}

