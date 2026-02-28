import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailingPageComponent } from './components/detailing-page/detailing-page.component';

const routes: Routes = [
  { path: '', component: DetailingPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailingRoutingModule {}

