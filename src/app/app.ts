  import { Component, signal } from '@angular/core';

  @Component({
    selector: 'qp-root',
    templateUrl: './app.html',
    standalone: false,
    styleUrl: './app.scss'
  })
  export class App {
    protected readonly title = signal('quindiparking');
    showAccessibilityPanel = false;
    showChatbot = false;
  }
