import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ParkingRoutingModule } from './parking-routing.module';
import { ParkingGridComponent } from './components/parking-grid/parking-grid.component';

@NgModule({
  declarations: [ParkingGridComponent],
  imports: [SharedModule, ParkingRoutingModule]
})
export class ParkingModule {}

