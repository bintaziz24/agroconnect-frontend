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
    const text = encodeURIComponent(message || 'Bonjour AgroConnect, je souhaite avoir des informations.');
    const url = `https://wa.me/${this.defaultNumber}?text=${text}`;
    window.open(url, '_blank');
  }

  ouvrirChatProduit(produit: any) {
    const telAgri = produit?.agriculteur?.user?.telephone || 
                    produit?.agriculteur?.telephone || 
                    produit?.agriculteur?.tel || 
                    produit?.telephone;

    const numClean = telAgri ? telAgri.replace(/\D/g, '') : '772345678';
    const numFormatted = numClean.startsWith('221') ? numClean : `221${numClean}`;
    const produitNom = produit?.nom || 'votre produit';
    const text = encodeURIComponent(`Bonjour, je suis intéressé par votre produit ${produitNom} sur AgroConnect.`);

    window.open(`https://wa.me/${numFormatted}?text=${text}`, '_blank');
  }

  ouvrirChatCommande(commande: any) {
    const telLivreur = commande?.livreur?.telephone || commande?.telephone_livreur;
    const numClean = telLivreur ? telLivreur.replace(/\D/g, '') : '778901234';
    const numFormatted = numClean.startsWith('221') ? numClean : `221${numClean}`;
    const text = encodeURIComponent(`Bonjour, je vous contacte au sujet de la livraison de la commande #${commande?.id || ''} sur AgroConnect.`);

    window.open(`https://wa.me/${numFormatted}?text=${text}`, '_blank');
  }

  getReponseAutomatique(type: string = 'accueil', donnees: any = {}): Observable<any> {
    return this.http.post(`${this.apiUrl}/whatsapp/reponse-automatique`, { type, donnees });
  }
}
