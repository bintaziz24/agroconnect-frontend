import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PanierService } from '../../services/panier';
import { WhatsappService } from '../../services/whatsapp';
import { DiscussionService } from '../../services/discussion';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-card-produit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-produit.html',
  styleUrl: './card-produit.scss',
})
export class CardProduit {
  @Input() produit: any;
  ajoute = false;
  modalOuvert = false;

  constructor(
    private panierService: PanierService,
    private whatsappService: WhatsappService,
    private discussionService: DiscussionService,
    private authService: AuthService,
    private router: Router
  ) {}

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role || 'client';
  }

  isMonProduit(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'agriculteur') return false;
    const agriculteurId = this.produit?.agriculteur_id || this.produit?.agriculteur?.id;
    const nomAgri = this.getNomAgriculteur(this.produit);
    return (agriculteurId && user.id === agriculteurId) || (user.name && nomAgri && user.name.toLowerCase() === nomAgri.toLowerCase());
  }

  allerDashboardAgriculteur(event?: Event) {
    if (event) event.stopPropagation();
    this.router.navigate(['/agriculteur/dashboard']);
  }

  avertirModeAgriculteur(event?: Event) {
    if (event) event.stopPropagation();
    alert('Vous êtes actuellement en Espace Agriculteur. Pour discuter ou commander des produits auprès d\'un autre producteur, veuillez utiliser l\'Espace Client dans la barre supérieure.');
  }

  discuterAvecAgriculteur(event?: Event) {
    if (event) event.stopPropagation();
    this.modalOuvert = false;
    if (!this.produit) return;

    if (this.getUserRole() === 'agriculteur') {
      this.avertirModeAgriculteur(event);
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    let agriculteurId = this.produit.agriculteur_id || this.produit.agriculteur?.id || this.produit.agriculteur?.user_id;
    const nomAgriculteur = this.getNomAgriculteur(this.produit);

    if (!agriculteurId) {
      if (nomAgriculteur.toLowerCase().includes('fatou')) agriculteurId = 2;
      else if (nomAgriculteur.toLowerCase().includes('ibrahima')) agriculteurId = 3;
      else if (nomAgriculteur.toLowerCase().includes('aïssatou') || nomAgriculteur.toLowerCase().includes('aissatou')) agriculteurId = 4;
      else if (nomAgriculteur.toLowerCase().includes('oumar')) agriculteurId = 5;
      else if (nomAgriculteur.toLowerCase().includes('mamadou')) agriculteurId = 1;
      else agriculteurId = 1;
    }

    const telAgriculteur = this.produit.agriculteur?.user?.telephone || this.produit.agriculteur?.telephone || this.produit.agriculteur?.tel || '';
    const nomProduit = this.produit.nom || 'Produit local';
    const imageProduit = this.produit.photo || this.produit.image || '';
    const prixProduit = this.produit.prix_unitaire || this.produit.prix || 1000;
    const uniteProduit = this.produit.unite_mesure || 'kg';

    this.discussionService.demarrerDiscussion({
      agriculteur_id: agriculteurId,
      produit_id: this.produit.id,
      nom_agriculteur: nomAgriculteur,
      telephone_agriculteur: telAgriculteur,
      nom_produit: nomProduit,
      image_produit: imageProduit,
      prix_produit: prixProduit,
      unite_produit: uniteProduit,
      message: `Bonjour ${nomAgriculteur}, je suis intéressé par votre produit ${nomProduit}.`
    }).subscribe({
      next: (disc) => {
        this.modalOuvert = false;
        if (disc && disc.id) {
          this.router.navigate(['/chat', disc.id]);
        } else {
          this.router.navigate(['/chat']);
        }
      },
      error: (err) => {
        console.error('Erreur démarrage chat', err);
        this.router.navigate(['/chat']);
      }
    });
  }

  commanderWhatsapp(event?: Event) {
    if (event) event.stopPropagation();
    if (!this.produit) return;
    this.whatsappService.ouvrirChatProduit(this.produit);
  }

  ajouterAuPanier(event: Event) {
    event.stopPropagation();
    if (!this.produit) return;

    this.panierService.ajouter(this.produit);
    this.ajoute = true;
    setTimeout(() => (this.ajoute = false), 1200);
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop';
  }

  getNomAgriculteur(produit: any): string {
    if (!produit) return 'Producteur local';
    if (typeof produit.agriculteur === 'string' && produit.agriculteur.trim()) {
      return produit.agriculteur;
    }
    if (produit.agriculteur && typeof produit.agriculteur === 'object') {
      return produit.agriculteur.user?.name || produit.agriculteur.user?.nom || produit.agriculteur.nom || produit.agriculteur.name || 'Producteur local';
    }
    return produit.producteur || 'Producteur local';
  }

  getLocalisationAgriculteur(produit: any): string {
    if (!produit) return 'Sénégal';
    if (typeof produit.region === 'string' && produit.region.trim()) {
      return produit.region;
    }
    if (produit.agriculteur && typeof produit.agriculteur === 'object') {
      return produit.agriculteur.localisation || produit.agriculteur.region || 'Sénégal';
    }
    return 'Sénégal';
  }

  getNomFerme(produit: any): string {
    if (!produit) return 'Ferme Bio Sénégal';
    if (produit.ferme?.nom_ferme) return produit.ferme.nom_ferme;
    if (produit.agriculteur?.fermes && produit.agriculteur.fermes.length > 0) {
      return produit.agriculteur.fermes[0].nom_ferme;
    }
    return 'Ferme AgroConnect (Sénégal)';
  }

  getNomLocal(nom: string): string {
    if (!nom) return 'Produit local';
    const nomLower = nom.toLowerCase();
    const nomsLocaux: Record<string, string> = {
      'carottes': 'Karott',
      'oignons': 'Sooble',
      'tomates': 'Tamatate',
      'laitue': 'Salad',
      'mangues': 'Màngu Casamance',
      'maïs': 'Mbaxal',
      'poivrons': 'Poivron',
      'patates': 'Patat',
      'aubergines': 'Batañse',
      'pastèques': 'Xal',
      'gombo': 'Kànja',
      'mil': 'Dugub',
      'poireaux': 'Poireau',
      'bananes': 'Banaana',
      'arachides': 'Gerté',
      'piment': 'Kani',
      'ignames': 'Ñàmbi',
      'concombres': 'Kombomb',
      'lait': 'Meew',
      'yaourt': 'Sow',
      'chou': 'Soof',
      'épinards': 'Epinard',
      'papayes': 'Papai',
      'sorgho': 'Basi',
      'courgettes': 'Courgette',
      'ananas': 'Ananas',
      'fromage': 'Fromage',
      'citrons': 'Limon'
    };

    for (const key of Object.keys(nomsLocaux)) {
      if (nomLower.includes(key)) {
        return nomsLocaux[key];
      }
    }
    return nom;
  }

  isBio(produit: any): boolean {
    if (!produit) return false;
    return !!(produit.is_bio || produit.bio || (produit.nom && produit.nom.toLowerCase().includes('bio')));
  }

  getRating(produit: any): string {
    if (!produit) return '4.8';
    return produit.rating ? produit.rating.toString() : '4.8';
  }
}
