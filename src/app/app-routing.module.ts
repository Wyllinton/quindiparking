import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { PaymentResultComponent } from './features/payment/components/payment-result/payment-result.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule)
  },
  // Mercado Pago callback routes
  { path: 'payment/success', component: PaymentResultComponent },
  { path: 'payment/failure', component: PaymentResultComponent },
  { path: 'payment/pending', component: PaymentResultComponent },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
