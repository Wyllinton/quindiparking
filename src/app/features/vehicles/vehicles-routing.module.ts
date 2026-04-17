import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/auth/guards/role.guard';
import { VehiclesPageComponent } from './components/vehicles-page/vehicles-page.component';

const routes: Routes = [
  {
    path: '',
    component: VehiclesPageComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'OPERATOR'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule {}

