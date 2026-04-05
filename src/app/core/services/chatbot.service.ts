import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatbotMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface ChatbotResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/chatbot/message`, { message });
  }
}



