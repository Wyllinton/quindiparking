import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { LayoutRoutingModule } from './layout-routing.module';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    MainLayoutComponent,
    NavbarComponent,
    SidebarComponent
  ],
  imports: [SharedModule, LayoutRoutingModule]
})
export class LayoutModule {}

