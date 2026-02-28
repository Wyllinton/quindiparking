import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DetailingRoutingModule } from './detailing-routing.module';
import { DetailingPageComponent } from './components/detailing-page/detailing-page.component';

@NgModule({
  declarations: [DetailingPageComponent],
  imports: [SharedModule, DetailingRoutingModule]
})
export class DetailingModule {}

