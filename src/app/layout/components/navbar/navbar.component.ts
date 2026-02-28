import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserDTO } from '../../../core/auth/models/user.model';

@Component({
  selector: 'qp-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  user: UserDTO | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (u) => this.user = u,
      error: () => {}
    });
  }


  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.notify.info('Sesión cerrada');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}


