import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private idTokenSubject = new Subject<string>();
  private initialized = false;
  private initializing = false;

  constructor(private ngZone: NgZone) {}

  /**
   * Loads the Google Identity Services script and initializes the client.
   * Safe to call multiple times — will only initialize once.
   */
  private loadGoogleSdk(): Promise<void> {
    if (this.initialized) return Promise.resolve();
    if (this.initializing) return Promise.resolve();

    this.initializing = true;

    return new Promise<void>((resolve, reject) => {
      // Check if script is already loaded
      if (typeof google !== 'undefined' && google.accounts) {
        this.initializeClient();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.initializeClient();
        resolve();
      };
      script.onerror = () => {
        this.initializing = false;
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }

  private initializeClient(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.ngZone.run(() => {
          this.idTokenSubject.next(response.credential);
        });
      }
    });
    this.initialized = true;
    this.initializing = false;
  }

  /**
   * Renders the Google Sign-In button inside the given container element.
   */
  renderButton(element: HTMLElement): void {
    this.loadGoogleSdk().then(() => {
      google.accounts.id.renderButton(element, {
        type: 'standard',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        theme: 'outline',
        width: 350,
        locale: 'es'
      });
    }).catch(err => {
      console.warn('Google Sign-In not available:', err);
    });
  }

  /**
   * Observable that emits the Google ID token when a user signs in.
   */
  getIdToken(): Observable<string> {
    return this.idTokenSubject.asObservable();
  }
}

