import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  success(message: string, duration = 4000): void {
    this.emit({ message, type: 'success', duration });
  }

  error(message: string, duration = 6000): void {
    this.emit({ message, type: 'error', duration });
  }

  warning(message: string, duration = 5000): void {
    this.emit({ message, type: 'warning', duration });
  }

  info(message: string, duration = 4000): void {
    this.emit({ message, type: 'info', duration });
  }

  private emit(partial: Omit<Toast, 'id'>): void {
    this.toastSubject.next({ ...partial, id: ++this.counter });
  }
}

