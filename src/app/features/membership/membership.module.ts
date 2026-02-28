import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { MembershipRoutingModule } from './membership-routing.module';
import { MembershipPageComponent } from './components/membership-page/membership-page.component';

@NgModule({
  declarations: [MembershipPageComponent],
  imports: [SharedModule, MembershipRoutingModule]
})
export class MembershipModule {}

