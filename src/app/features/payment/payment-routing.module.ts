import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { InvoicesPageComponent } from './components/invoices-page/invoices-page.component';

const routes: Routes = [
  { path: '', component: InvoicesPageComponent }
];

@NgModule({
  declarations: [InvoicesPageComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class InvoicesModule {}
