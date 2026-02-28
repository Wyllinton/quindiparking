import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsPageComponent } from './components/clients-page/clients-page.component';

@NgModule({
  declarations: [ClientsPageComponent],
  imports: [SharedModule, ClientsRoutingModule]
})
export class ClientsModule {}

