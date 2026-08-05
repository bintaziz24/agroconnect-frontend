import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) this.userSubject.next(JSON.parse(user));
  }

  register(data: any): Observable<any> {
    const payload = { ...data };
    if (payload.email) payload.email = payload.email.trim().toLowerCase();
    return this.http.post(`${this.apiUrl}/register`, payload, {
      headers: { 'Accept': 'application/json' }
    }).pipe(
      tap((res: any) => {
        if (res && res.token) this.setSession(res);
      })
    );
  }


  login(data: any): Observable<any> {
    const payload = { ...data };
    if (payload.email) payload.email = payload.email.trim().toLowerCase();
    return this.http.post(`${this.apiUrl}/login`, payload, {
      headers: { 'Accept': 'application/json' }
    }).pipe(
      tap((res: any) => {
        if (res && res.token) this.setSession(res);
      })
    );
  }

  logout(): Observable<any> {
    // Déconnexion instantanée côté client (0ms de latence)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);

    // Notification asynchrone du backend sans bloquer l'interface
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });

    return of({ success: true });
  }

  private setSession(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  getRole(): string {
    return this.getUser()?.role || '';
  }
}