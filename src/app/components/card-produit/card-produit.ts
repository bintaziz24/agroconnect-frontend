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

  getNomLocal(nom: string): string {
    const nomsLocaux: Record<string, string> = {
      'carottes': 'Karott',
      'oignons': 'Sooble',
      'tomates': 'Tamatate',
      'laitue': 'Salad',
      'mangues': 'Màngu Casamance',
      'maïs': 'Mbaxal',
      'poivrons': 'Poivron',
      'patates': 'Patat',
      'aubergines': 'Bataanzé',
      'pastèques': 'Xal',
      'gombo': 'Kandja',
      'mil': 'Dugub',
      'poireaux': 'Poireau',
      'bananes': 'Banan',
      'arachides': 'Guerté',
      'piment': 'Kaani',
      'ignames': 'Igname',
      'concombres': 'Concombre',
      'lait': 'Meew',
      'yaourt': 'Sow'
    };

    const searchStr = nom.toLowerCase();
    for (const key in nomsLocaux) {
      if (searchStr.includes(key)) {
        return nomsLocaux[key];
      }
    }
    return 'Produit local';
  }

  getRating(produit: any): string {
    if (produit.rating) return produit.rating;
    const score = ((produit.id || 1) % 6) / 10 + 4.4;
    return score.toFixed(1);
  }

  isBio(produit: any): boolean {
    const cat = (produit.categorie || '').toLowerCase();
    return cat.includes('lég') || cat.includes('frui') || cat.includes('cér') || cat.includes('tub');
  }
}
