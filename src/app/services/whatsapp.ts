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
    const text = message || "Bonjour AgroConnect ! Je souhaite obtenir des informations sur vos produits agricoles.";
    const url = `https://wa.me/${this.defaultNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  ouvrirChatProduit(produit: any) {
    const nom = produit.nom || 'ce produit';
    const prix = produit.prix ? `${produit.prix} FCFA` : '';
    const text = `Bonjour AgroConnect ! Je suis intéressé par *${nom}* (${prix}). Est-il disponible ?`;
    this.ouvrirChatDirect(text);
  }

  ouvrirChatCommande(commande: any) {
    const id = commande.id || 'CMD';
    const total = commande.montant_total || commande.total || 0;
    const text = `Bonjour AgroConnect ! Je souhaite suivre l'état de ma commande *#CMD-${id}* (Total : ${total} FCFA).`;
    this.ouvrirChatDirect(text);
  }
}
