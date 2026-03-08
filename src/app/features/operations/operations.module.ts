import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { OperationsRoutingModule } from './operations-routing.module';
import { OperationsPageComponent } from './components/operations-page/operations-page.component';

@NgModule({
  declarations: [OperationsPageComponent],
  imports: [SharedModule, OperationsRoutingModule]
})
export class OperationsModule {}

