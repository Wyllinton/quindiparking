import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'qp-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  collapsed = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Parqueadero', icon: '🚗', route: '/dashboard/parking' },
    { label: 'Car Wash', icon: '🧽', route: '/dashboard/detailing' },
    { label: 'Clientes', icon: '👥', route: '/dashboard/clients' },
    { label: 'Membresías', icon: '💳', route: '/dashboard/memberships' },
    { label: 'Reportes', icon: '📈', route: '/dashboard/reports' }
  ];

  constructor(public router: Router) {}

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}

