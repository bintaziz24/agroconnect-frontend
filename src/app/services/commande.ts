import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommandeService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  creerCommande(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/commandes`, data);
  }

  getMesCommandes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/commandes`);
  }

  getCommande(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/commandes/${id}`);
  }

  getCommandesAgriculteur(): Observable<any> {
    return this.http.get(`${this.apiUrl}/agriculteur/commandes`);
  }
}

