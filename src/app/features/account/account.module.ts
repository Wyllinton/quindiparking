import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AccountRoutingModule } from './account-routing.module';
import { AccountPageComponent } from './components/account-page/account-page.component';

@NgModule({
  declarations: [AccountPageComponent],
  imports: [SharedModule, AccountRoutingModule]
})
export class AccountModule {}

