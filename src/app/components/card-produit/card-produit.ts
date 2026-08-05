import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanierService } from '../../services/panier';

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

  constructor(private panierService: PanierService) {}

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
