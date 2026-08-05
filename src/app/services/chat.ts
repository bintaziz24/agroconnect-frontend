import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  id?: string;
  missionId: string;
  auteur: string;
  role: 'CUSTOMER' | 'DRIVER' | 'SYSTEM' | 'FARMER';
  texte: string;
  temps: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly STORAGE_KEY_PREFIX = 'agroconnect_chat_';
  private subjects: { [missionId: string]: BehaviorSubject<ChatMessage[]> } = {};

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(this.STORAGE_KEY_PREFIX)) {
        const missionId = e.key.replace(this.STORAGE_KEY_PREFIX, '');
        this.notifySubscribers(missionId);
      }
    });
  }

  getMessages(missionId: string): ChatMessage[] {
    const key = this.STORAGE_KEY_PREFIX + missionId;
    const raw = localStorage.getItem(key);
    if (!raw) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initial: ChatMessage[] = [
        {
          missionId,
          auteur: 'Système AgroConnect',
          role: 'SYSTEM',
          texte: `📍 Mission #${missionId} activée. Canal de discussion direct entre le client et le livreur.`,
          temps: nowStr
        }
      ];
      this.saveMessages(missionId, initial);
      return initial;
    }

    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  getMessagesObservable(missionId: string): Observable<ChatMessage[]> {
    if (!this.subjects[missionId]) {
      this.subjects[missionId] = new BehaviorSubject<ChatMessage[]>(this.getMessages(missionId));
    } else {
      this.subjects[missionId].next(this.getMessages(missionId));
    }
    return this.subjects[missionId].asObservable();
  }

  sendMessage(missionId: string, auteur: string, role: 'CUSTOMER' | 'DRIVER' | 'FARMER', texte: string): ChatMessage[] {
    const list = this.getMessages(missionId);
    const dateNow = new Date();
    const timeStr = dateNow.getHours().toString().padStart(2, '0') + ':' + dateNow.getMinutes().toString().padStart(2, '0');

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      missionId,
      auteur,
      role,
      texte: texte.trim(),
      temps: timeStr
    };

    list.push(newMsg);
    this.saveMessages(missionId, list);
    return list;
  }

  private saveMessages(missionId: string, messages: ChatMessage[]) {
    const key = this.STORAGE_KEY_PREFIX + missionId;
    localStorage.setItem(key, JSON.stringify(messages));
    this.notifySubscribers(missionId);
  }

  private notifySubscribers(missionId: string) {
    if (this.subjects[missionId]) {
      this.subjects[missionId].next(this.getMessages(missionId));
    }
  }
}
