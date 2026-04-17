import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehiclesRoutingModule } from './vehicles-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { VehiclesPageComponent } from './components/vehicles-page/vehicles-page.component';

@NgModule({
  declarations: [
    VehiclesPageComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    VehiclesRoutingModule
  ]
})
export class VehiclesModule {}
