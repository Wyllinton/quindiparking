import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../core/auth/services/token.service';

@Component({
  selector: 'qp-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {

  constructor(
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    // If USER role lands on the root dashboard, redirect to parking
    if (this.router.url === '/dashboard') {
      const role = this.extractRole();
      if (role === 'USER') {
        this.router.navigate(['/dashboard/parking']);
      }
    }
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

