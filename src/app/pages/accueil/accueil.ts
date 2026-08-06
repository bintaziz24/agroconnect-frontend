import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit';
import { PanierService } from '../../services/panier';
import { CardProduit } from '../../components/card-produit/card-produit';
import { TranslationService } from '../../services/translation';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink, CardProduit],
  templateUrl: './accueil.html',
  styleUrl: './accueil.scss',
})
export class AccueilComponent implements OnInit, OnDestroy, AfterViewInit {
  produits: any[] = [];
  
  heroSlides = [
    {
      nom: 'Tomates fraîches Bio',
      origine: '📍 Niayes, Sénégal',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=600&fit=crop'
    },
    {
      nom: 'Mangues Kent succulentes',
      origine: '📍 Ziguinchor, Casamance',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=600&fit=crop'
    },
    {
      nom: 'Oignons Violets locaux',
      origine: '📍 Podor, Vallée du Fleuve',
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&h=600&fit=crop'
    },
    {
      nom: 'Riz parfumé de la Vallée',
      origine: '📍 Richard-Toll, Saint-Louis',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop'
    }
  ];
  currentSlideIndex = 0;
  slideInterval: any = null;

  categories = [
    { nom: 'Légumes', count: 124 },
    { nom: 'Fruits', count: 86 },
    { nom: 'Céréales & Graines', count: 62 },
    { nom: 'Tubercules', count: 45 },
    { nom: 'Épices & Herbes', count: 38 },
    { nom: 'Produits Transformés', count: 51 }
  ];
  
  faqs = [
    {
      question: "Quels sont les délais de livraison à Dakar et dans les régions ?",
      answer: "À Dakar, les livraisons se font généralement sous 24h. Dans les autres régions (Thiès, Saint-Louis, Mbour, etc.), les livraisons s'effectuent sous 48h à 72h selon la disponibilité des transporteurs.",
      open: false
    },
    {
      question: "Je suis agriculteur, comment vendre mes récoltes sur la plateforme ?",
      answer: "C'est très simple ! Créez un compte 'Agriculteur', remplissez votre localisation et la description de votre exploitation. Une fois votre compte validé par notre équipe d'administration, vous pourrez publier vos produits et gérer vos commandes.",
      open: false
    },
    {
      question: "Comment fonctionne le suivi en direct de la livraison ?",
      answer: "Une fois votre commande validée, vous pouvez suivre son statut en temps réel sur votre dashboard (En attente, Préparation, Expédiée, En cours de livraison, Livrée). Chaque étape est mise à jour par l'agriculteur et le livreur.",
      open: false
    },
    {
      question: "Puis-je commander en grande quantité pour un restaurant ou un hôtel ?",
      answer: "Oui, AgroConnect prend en charge les commandes de gros volumes. Vous pouvez contacter les producteurs directement ou joindre notre service client pour négocier des contrats de livraison réguliers.",
      open: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  produitsDemo = [
    {
      id: 1, nom: 'Carottes fraîches', prix: 500, unite: 'kg',
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=200&fit=crop',
      categorie: 'Légumes',
      agriculteur: { nom: 'Mamadou Diallo', localisation: 'Thiès' }
    },
    {
      id: 2, nom: 'Oignons violets', prix: 350, unite: 'kg',
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=200&fit=crop',
      categorie: 'Légumes',
      agriculteur: { nom: 'Fatou Seck', localisation: 'Dakar' }
    },
    {
      id: 3, nom: 'Tomates cerises', prix: 800, unite: 'kg',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=200&fit=crop',
      categorie: 'Fruits',
      agriculteur: { nom: 'Ibrahima Bâ', localisation: 'Saint-Louis' }
    },
    {
      id: 4, nom: 'Laitue verte', prix: 250, unite: 'pièce',
      image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=200&fit=crop',
      categorie: 'Légumes',
      agriculteur: { nom: 'Aïssatou Ndiaye', localisation: 'Mbour' }
    },
    {
      id: 5, nom: 'Mangues Kent', prix: 1200, unite: 'kg',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=200&fit=crop',
      categorie: 'Fruits',
      agriculteur: { nom: 'Oumar Sy', localisation: 'Ziguinchor' }
    },
    {
      id: 6, nom: 'Maïs local', prix: 300, unite: 'kg',
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=200&fit=crop',
      categorie: 'Céréales',
      agriculteur: { nom: 'Alioune Fall', localisation: 'Kaolack' }
    },
    {
      id: 7, nom: 'Poivrons verts', prix: 600, unite: 'kg',
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=200&fit=crop',
      categorie: 'Légumes',
      agriculteur: { nom: 'Mariama Dione', localisation: 'Thiès' }
    },
    {
      id: 8, nom: 'Patates douces', prix: 400, unite: 'kg',
      image: 'https://images.unsplash.com/photo-1596097635121-14b38c5d7a27?w=400&h=200&fit=crop',
      categorie: 'Tubercules',
      agriculteur: { nom: 'Cheikh Mbaye', localisation: 'Louga' }
    },
  ];

  constructor(
    private produitService: ProduitService,
    private panierService: PanierService,
    public trans: TranslationService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.05
      });

      const elements = this.el.nativeElement.querySelectorAll('.animate-on-scroll');
      elements.forEach((element: any) => observer.observe(element));
    }
  }

  t(key: string): string {
    return this.trans.translate(key);
  }

  nextSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.heroSlides.length;
    this.cdr.detectChanges();
  }

  prevSlide() {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
    this.cdr.detectChanges();
  }

  goToSlide(index: number) {
    this.currentSlideIndex = index;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.slideInterval = setInterval(() => {
        this.nextSlide();
      }, 3000);
    }

    this.produitService.getProduits().subscribe({
      next: (res) => {
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          this.produits = data.map((p: any) => ({
            id:          p.id,
            nom:         p.nom,
            prix:        p.prix,
            unite:       p.unite || 'kg',
            categorie:   p.categorie?.nom ?? 'Légumes',
            agriculteur: {
              nom:          p.agriculteur?.user?.name ?? 'Agriculteur',
              localisation: p.agriculteur?.localisation ?? 'Sénégal',
            },
            stock: p.stock,
            image: p.photo ?? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
          }));
        } else {
          this.produits = this.produitsDemo;
        }
      },
      error: () => {
        this.produits = this.produitsDemo;
      }
    });
  }

  ajouterAuPanier(produit: any) {
    this.panierService.ajouter(produit);
  }
}