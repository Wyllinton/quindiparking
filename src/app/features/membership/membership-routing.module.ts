import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembershipPageComponent } from './components/membership-page/membership-page.component';
import { RoleGuard } from '../../core/auth/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: MembershipPageComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembershipRoutingModule {}
