import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit
} from '@angular/core';
import { ChatbotService, ChatbotMessage, ChatbotResponse } from '../../../core/services/chatbot.service';

@Component({
  selector: 'qp-chatbot',
  standalone: false,
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @Output() closed = new EventEmitter<void>();
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  messages: ChatbotMessage[] = [];
  inputText = '';
  loading = false;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.messages.push({
      role: 'bot',
      text: '¡Hola! Soy el asistente de Quindi Parking. ¿En qué te puedo ayudar?',
      timestamp: new Date()
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch (_) {}
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text || this.loading) return;

    this.messages.push({ role: 'user', text, timestamp: new Date() });
    this.inputText = '';
    this.loading = true;

    this.chatbotService.sendMessage(text).subscribe({
      next: (res: ChatbotResponse) => {
        this.messages.push({ role: 'bot', text: res.reply, timestamp: new Date() });
        this.loading = false;
      },
      error: () => {
        this.messages.push({
          role: 'bot',
          text: 'Lo siento, hubo un error al procesar tu mensaje. Intenta de nuevo.',
          timestamp: new Date()
        });
        this.loading = false;
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}








