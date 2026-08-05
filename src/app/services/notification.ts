import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth';

export interface AppNotification {
  id: number;
  icon: string;
  titre: string;
  temps: string;
  message: string;
  lu: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly PREFIX_STORAGE_KEY = 'agroconnect_notifications_';
  private currentUserId: string = 'guest';

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private authService: AuthService) {
    // Nettoyer l'ancienne clé statique si présente
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agroconnect_notifications');
    }

    this.authService.user$.subscribe(user => {
      this.currentUserId = user ? (user.id || user.email || 'user') : 'guest';
      this.loadNotifications();
    });
  }

  private getStorageKey(): string {
    return this.PREFIX_STORAGE_KEY + this.currentUserId;
  }

  private loadNotifications() {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(this.getStorageKey());
    let list: AppNotification[] = [];

    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        list = [];
      }
    } else {
      list = [];
    }

    this.updateSubjects(list);
  }

  private saveToStorage(list: AppNotification[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(list));
    }
  }

  private updateSubjects(list: AppNotification[]) {
    this.notificationsSubject.next(list);
    const unread = list.filter(n => !n.lu).length;
    this.unreadCountSubject.next(unread);
  }

  ajouterNotification(notif: Omit<AppNotification, 'id' | 'lu'>) {
    const current = this.notificationsSubject.value;
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now(),
      lu: false
    };
    const updated = [newNotif, ...current];
    this.saveToStorage(updated);
    this.updateSubjects(updated);
  }

  marquerCommeLu(id: number) {
    const updated = this.notificationsSubject.value.map(n => {
      if (n.id === id) {
        return { ...n, lu: true };
      }
      return n;
    });
    this.saveToStorage(updated);
    this.updateSubjects(updated);
  }

  marquerToutCommeLu() {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, lu: true }));
    this.saveToStorage(updated);
    this.updateSubjects(updated);
  }

  supprimerNotification(id: number) {
    const updated = this.notificationsSubject.value.filter(n => n.id !== id);
    this.saveToStorage(updated);
    this.updateSubjects(updated);
  }
}
