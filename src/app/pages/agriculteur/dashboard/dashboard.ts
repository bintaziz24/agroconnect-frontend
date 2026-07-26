import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProduitService } from '../../../services/produit';
import { CommandeService } from '../../../services/commande';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-agriculteur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  user: any = null;
  ongletActif: 'apercu' | 'produits' | 'commandes' = 'apercu';

  stats = {
    revenus: 845000,
    commandes: 24,
    produits: 8,
  };

  produits: any[] = [
    { id: 1, nom: 'Carottes fraîches', prix: 500, unite: 'kg', stock: 45, categorie: 'Légumes', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=200&fit=crop' },
    { id: 2, nom: 'Poivrons verts', prix: 600, unite: 'kg', stock: 25, categorie: 'Légumes', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=200&fit=crop' },
    { id: 3, nom: 'Courgettes bio', prix: 450, unite: 'kg', stock: 35, categorie: 'Légumes', image: 'https://images.unsplash.com/photo-1563252722-6434563a985d?w=400&h=200&fit=crop' },
  ];

  commandes: any[] = [
    { id: 201, client: 'Awa Diop', produit: 'Carottes 5kg', total: 2500, date: '20/07/2025', statut: 'en_attente', adresse: 'Dakar, Mermoz' },
    { id: 202, client: 'Moussa Ndiaye', produit: 'Poivrons 3kg', total: 1800, date: '19/07/2025', statut: 'livre', adresse: 'Thiès, Cité Lamy' },
    { id: 203, client: 'Fatou Bâ', produit: 'Courgettes 4kg', total: 1800, date: '18/07/2025', statut: 'en_cours', adresse: 'Saint-Louis' },
  ];

  afficherModalForm = false;
  nouveauProduit = {
    nom: '',
    nomLocal: '',
    region: 'Thiès',
    prix: 1000,
    unite: 'kg',
    stock: 100,
    categorie: 'Légumes',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop',
    description: 'Récolte fraîche du jour au Sénégal, sans produits chimiques nocifs.',
  };

  categories = ['Légumes', 'Fruits', 'Céréales', 'Tubercules', 'Produits laitiers'];
  regions = ['Thiès', 'Dakar', 'Ziguinchor', 'Saint-Louis', 'Kaolack', 'Louga', 'Diourbel', 'Fatick', 'Kolda', 'Matam', 'Tambacounda'];
  illustrationSelectionnee = 'mangues';

  illustrations = [
    { id: 'mangues', nom: 'Mangues', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop' },
    { id: 'oignons', nom: 'Oignons', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&h=200&fit=crop' },
    { id: 'riz', nom: 'Riz', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
    { id: 'tomates', nom: 'Tomates', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop' },
    { id: 'bissap', nom: 'Bissap', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop' },
    { id: 'arachides', nom: 'Arachides', url: 'https://images.unsplash.com/photo-1567894220023-e1bd5e5074be?w=200&h=200&fit=crop' }
  ];

  selectIllustration(id: string) {
    this.illustrationSelectionnee = id;
    const item = this.illustrations.find(i => i.id === id);
    if (item) {
      this.nouveauProduit.image = item.url;
    }
  }

  constructor(
    private produitService: ProduitService,
    private commandeService: CommandeService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.chargerDashboardData();

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.ongletActif = params['tab'];
      } else {
        this.ongletActif = 'apercu';
      }
    });
  }

  chargerDashboardData() {
    this.produitService.getDashboard().subscribe({
      next: (res) => {
        if (res) {
          this.stats.commandes = res.commandes || this.stats.commandes;
          this.stats.revenus = res.revenus || this.stats.revenus;
          this.stats.produits = res.produits || this.stats.produits;
          if (res.dernieres_commandes?.length) {
            this.commandes = res.dernieres_commandes;
          }
        }
      },
      error: () => {}
    });

    this.produitService.getProduits().subscribe({
      next: (res) => {
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          this.produits = data.map((p: any) => ({
            id: p.id,
            nom: p.nom,
            prix: p.prix,
            unite: p.unite || 'kg',
            stock: p.stock,
            categorie: p.categorie?.nom || 'Légumes',
            image: p.photo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop'
          }));
        }
      },
      error: () => {}
    });
  }

  ajouterProduit() {
    if (!this.nouveauProduit.nom || !this.nouveauProduit.prix) return;

    const newProd = {
      id: Date.now(),
      ...this.nouveauProduit
    };

    this.produits.unshift(newProd);
    this.stats.produits = this.produits.length;
    this.afficherModalForm = false;

    // Tentative de sauvegarde API
    const formData = new FormData();
    formData.append('nom', this.nouveauProduit.nom);
    formData.append('prix', this.nouveauProduit.prix.toString());
    formData.append('stock', this.nouveauProduit.stock.toString());
    formData.append('unite', this.nouveauProduit.unite);
    formData.append('categorie_id', '1');

    this.produitService.creerProduit(formData).subscribe({
      next: () => {},
      error: () => {}
    });

    // Reset Form
    this.nouveauProduit = {
      nom: '',
      nomLocal: '',
      region: 'Thiès',
      prix: 1000,
      unite: 'kg',
      stock: 100,
      categorie: 'Légumes',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop',
      description: 'Récolte fraîche du jour au Sénégal, sans produits chimiques nocifs.',
    };
  }

  supprimerProduit(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.produits = this.produits.filter(p => p.id !== id);
      this.stats.produits = this.produits.length;
      this.produitService.supprimerProduit(id).subscribe({
        next: () => {},
        error: () => {}
      });
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop';
  }
}
