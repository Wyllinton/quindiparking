import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PricingComponent } from './components/pricing/pricing.component';

@NgModule({
  declarations: [DashboardComponent, PricingComponent],
  imports: [SharedModule, AdminRoutingModule]
})
export class AdminModule {}


