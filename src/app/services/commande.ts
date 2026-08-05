import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommandeService {
  private apiUrl = environment.apiUrl;

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

