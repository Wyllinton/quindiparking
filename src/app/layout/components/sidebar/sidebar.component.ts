import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../core/auth/services/token.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];  // if undefined, visible to all
}

@Component({
  selector: 'qp-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  collapsed = false;
  filteredNavItems: NavItem[] = [];

  private allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Parqueadero', icon: '🚗', route: '/dashboard/parking' },
    { label: 'Operaciones', icon: '🎫', route: '/dashboard/operations', roles: ['OPERATOR', 'ADMIN'] },
    { label: 'Car Wash', icon: '🧽', route: '/dashboard/detailing', roles: ['ADMIN'] },
    { label: 'Clientes', icon: '👥', route: '/dashboard/clients', roles: ['ADMIN'] },
    { label: 'Membresías', icon: '💳', route: '/dashboard/memberships', roles: ['ADMIN'] },
    { label: 'Reportes', icon: '📈', route: '/dashboard/reports', roles: ['ADMIN'] }
  ];

  private userRole = '';

  constructor(
    public router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.userRole = this.extractRole();
    this.filteredNavItems = this.allNavItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(this.userRole);
    });
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  private extractRole(): string {
    const token = this.tokenService.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || payload.roles || '';
    } catch {
      return '';
    }
  }
}

