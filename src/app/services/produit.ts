import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProduitService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProduits(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters?.search)    params = params.set('search', filters.search);
    if (filters?.categorie) params = params.set('categorie', filters.categorie);
    if (filters?.prix_max)  params = params.set('prix_max', filters.prix_max);
    return this.http.get(`${this.apiUrl}/produits`, { params });
  }

  getProduit(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/produits/${id}`);
  }

  creerProduit(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/produits`, data);
  }

  modifierProduit(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/produits/${id}`, data);
  }

  supprimerProduit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produits/${id}`);
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/agriculteur/dashboard`);
  }

  getAgriculteurs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/agriculteurs`);
  }
}