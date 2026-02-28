import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParkingGridComponent } from './components/parking-grid/parking-grid.component';

const routes: Routes = [
  { path: '', component: ParkingGridComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParkingRoutingModule {}

