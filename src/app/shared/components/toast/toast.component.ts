import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Toast } from '../../../core/services/notification.service';

@Component({
  selector: 'qp-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.sub = this.notificationService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => this.remove(toast.id), toast.duration);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}

