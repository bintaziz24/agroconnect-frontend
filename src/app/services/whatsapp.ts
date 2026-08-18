import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private apiUrl = environment.apiUrl;
  private defaultNumber = '221765512974';

  constructor(private http: HttpClient) {}

  getConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/whatsapp/config`);
  }

  genererLienCommande(commandeData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/whatsapp/lien-commande`, commandeData);
  }

  ouvrirChatDirect(message?: string) {
    const url = `https://wa.me/${this.defaultNumber}`;
    window.open(url, '_blank');
  }

  ouvrirChatProduit(produit: any) {
    this.ouvrirChatDirect();
  }

  ouvrirChatCommande(commande: any) {
    this.ouvrirChatDirect();
  }

  getReponseAutomatique(type: string = 'accueil', donnees: any = {}): Observable<any> {
    return this.http.post(`${this.apiUrl}/whatsapp/reponse-automatique`, { type, donnees });
  }
}
