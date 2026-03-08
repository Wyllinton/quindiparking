import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';


const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('../features/admin/admin.module').then(m => m.AdminModule) },
      { path: 'parking', loadChildren: () => import('../features/parking/parking.module').then(m => m.ParkingModule) },
      { path: 'operations', loadChildren: () => import('../features/operations/operations.module').then(m => m.OperationsModule) },
      { path: 'detailing', loadChildren: () => import('../features/detailing/detailing.module').then(m => m.DetailingModule) },
      { path: 'clients', loadChildren: () => import('../features/clients/clients.module').then(m => m.ClientsModule) },
      { path: 'invoices', loadChildren: () => import('../features/payment/payment-routing.module').then(m => m.InvoicesModule) },
      { path: 'memberships', loadChildren: () => import('../features/membership/membership.module').then(m => m.MembershipModule) },
      { path: 'reports', loadChildren: () => import('../features/reports/reports.module').then(m => m.ReportsModule) },
      { path: 'account', loadChildren: () => import('../features/account/account.module').then(m => m.AccountModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}


