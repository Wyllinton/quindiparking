import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { TimeElapsedPipe } from './pipes/time-elapsed.pipe';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ModalComponent } from './components/modal/modal.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ToastComponent } from './components/toast/toast.component';
import { AccessibilityPanelComponent } from './components/accessibility-panel/accessibility-panel.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@NgModule({
  declarations: [
    CurrencyFormatPipe,
    TimeElapsedPipe,
    ClickOutsideDirective,
    ModalComponent,
    LoadingSpinnerComponent,
    ToastComponent,
    AccessibilityPanelComponent,
    ChatbotComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CurrencyFormatPipe,
    TimeElapsedPipe,
    ClickOutsideDirective,
    ModalComponent,
    LoadingSpinnerComponent,
    ToastComponent,
    AccessibilityPanelComponent,
    ChatbotComponent
  ]
})
export class SharedModule {}

