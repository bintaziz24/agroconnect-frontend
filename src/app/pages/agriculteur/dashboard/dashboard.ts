import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProduitService } from '../../../services/produit';
import { CommandeService } from '../../../services/commande';
import { AuthService } from '../../../services/auth';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-agriculteur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  ongletActif: 'apercu' | 'produits' | 'commandes' = 'apercu';
  pollInterval: any = null;
  nouvelleCommandeAlerte = false;
  nombreCommandesPrecedent = 0;

  stats = {
    revenus: 0,
    commandes: 0,
    produits: 0,
    note: 4.8,
    nombreAvis: 0
  };

  produits: any[] = [];
  commandes: any[] = [];

  afficherModalForm = false;
  nouveauProduit = {
    nom: '',
    nomLocal: '',
    region: 'Thiès',
    prix: 1000,
    unite: 'kg',
    stock: 100,
    categorie: 'Légumes',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop',
    description: 'Récolte fraîche du jour au Sénégal, sans produits chimiques nocifs.',
  };

  categories = ['Légumes', 'Fruits', 'Céréales & Graines', 'Tubercules', 'Épices & Herbes', 'Produits Transformés', 'Produits laitiers'];
  regions = ['Thiès', 'Dakar', 'Ziguinchor', 'Saint-Louis', 'Kaolack', 'Louga', 'Diourbel', 'Fatick', 'Kolda', 'Matam', 'Tambacounda'];
  illustrationSelectionnee = 'mangues';

  illustrations = [
    { id: 'mangues', nom: 'Mangues', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop' },
    { id: 'oignons', nom: 'Oignons violets', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop' },
    { id: 'riz', nom: 'Riz de la Vallée', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop' },
    { id: 'tomates', nom: 'Tomates', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop' },
    { id: 'bissap', nom: 'Fleurs de Bissap', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&h=300&fit=crop' },
    { id: 'arachides', nom: 'Arachides', url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=300&h=300&fit=crop' },
    { id: 'carottes', nom: 'Carottes', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop' },
    { id: 'pasteques', nom: 'Pastèques', url: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=300&h=300&fit=crop' },
    { id: 'mais', nom: 'Maïs local', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop' },
    { id: 'laitue', nom: 'Salade / Laitue', url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop' },
    { id: 'poivrons', nom: 'Poivrons verts', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&h=300&fit=crop' },
    { id: 'patates', nom: 'Patates Douces', url: 'https://images.unsplash.com/photo-1596450514735-31952e46b088?w=300&h=300&fit=crop' },
    { id: 'piment', nom: 'Piment rouge', url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=300&h=300&fit=crop' },
    { id: 'bananes', nom: 'Bananes Plantains', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop' },
    { id: 'citrons', nom: 'Citrons', url: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300&h=300&fit=crop' },
    { id: 'aubergines', nom: 'Aubergines', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=300&fit=crop' }
  ];

  @HostListener('window:storage')
  @HostListener('window:nouvelle-commande')
  onCommandeReceived() {
    this.chargerDashboardData();
  }

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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
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
      this.cdr.detectChanges();
    });

    // Polling automatique toutes les 3 secondes pour réactualiser instantanément les commandes
    this.pollInterval = setInterval(() => {
      this.chargerDashboardData();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private deduplicateByName(items: any[]): any[] {
    if (!Array.isArray(items)) return [];
    const seen = new Set();
    return items.filter(item => {
      if (!item) return false;
      const key = item.nom ? item.nom.toLowerCase().trim() : String(item.id || JSON.stringify(item));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  chargerDashboardData() {
    this.produitService.getDashboard().subscribe({
      next: (res) => {
        if (res) {
          const nouvellesCommandes = res.commandes !== undefined ? res.commandes : 0;
          
          if (this.nombreCommandesPrecedent > 0 && nouvellesCommandes > this.nombreCommandesPrecedent) {
            this.nouvelleCommandeAlerte = true;
            setTimeout(() => (this.nouvelleCommandeAlerte = false), 6000);
          }
          this.nombreCommandesPrecedent = nouvellesCommandes;

          this.stats.commandes = nouvellesCommandes;
          this.stats.revenus = res.revenus !== undefined ? res.revenus : 0;
          this.stats.nombreAvis = res.nombre_avis !== undefined ? res.nombre_avis : (nouvellesCommandes > 0 ? nouvellesCommandes * 2 : 0);
          this.stats.note = res.note !== undefined ? res.note : (this.stats.nombreAvis > 0 ? 4.8 : 5.0);
          this.commandes = Array.isArray(res.dernieres_commandes) ? res.dernieres_commandes : [];
          
          if (Array.isArray(res.mes_produits)) {
            const rawProduits = res.mes_produits.map((p: any) => ({
              id: p.id,
              nom: p.nom,
              prix: p.prix,
              unite: p.unite || 'kg',
              stock: p.stock,
              categorie: p.categorie?.nom || 'Légumes',
              agriculteur: p.agriculteur?.user?.name || p.agriculteur?.nom || this.user?.name || 'Mon Exploitation',
              image: p.photo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop'
            }));
            this.produits = this.deduplicateByName(rawProduits);
            this.stats.produits = this.produits.length;
          }

          if (res.statut_validation) {
            if (!this.user) this.user = {};
            this.user.statut_validation = res.statut_validation;
            localStorage.setItem('user', JSON.stringify(this.user));
          }

          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  ouvrirModalForm() {
    const statut = this.user?.statut_validation;
    if (statut && statut !== 'validé') {
      alert("⏳ Votre compte agriculteur est actuellement en cours de vérification par l'administration AgroConnect.\n\nVous pourrez ajouter et publier vos récoltes dès que votre compte aura été validé par un administrateur.");
      this.afficherModalForm = false;
      return;
    }
    this.afficherModalForm = true;
  }

  ajouterProduit() {
    const statut = this.user?.statut_validation;
    if (statut && statut !== 'validé') {
      alert("⏳ Votre compte agriculteur est actuellement en cours de vérification par l'administration AgroConnect. Vous ne pouvez pas encore publier de récoltes.");
      this.afficherModalForm = false;
      return;
    }

    if (!this.nouveauProduit.nom || !this.nouveauProduit.prix) return;

    const nomSaisi = this.nouveauProduit.nom.trim().toLowerCase();
    
    // Détection de produit déjà existant dans le stock de l'agriculteur
    const produitExistant = this.produits.find(p => p.nom && p.nom.trim().toLowerCase() === nomSaisi);

    if (produitExistant) {
      const quantiteAjoutee = Number(this.nouveauProduit.stock || 0);
      const nouveauStock = Number(produitExistant.stock) + quantiteAjoutee;
      produitExistant.stock = nouveauStock;
      produitExistant.prix = this.nouveauProduit.prix;
      if (this.nouveauProduit.image) {
        produitExistant.image = this.nouveauProduit.image;
      }

      this.afficherModalForm = false;
      this.produitService.modifierProduit(produitExistant.id, {
        stock: nouveauStock,
        prix: this.nouveauProduit.prix
      }).subscribe({
        next: () => this.chargerDashboardData(),
        error: () => {}
      });

      alert(`Le produit "${produitExistant.nom}" figurait déjà dans votre inventaire. Son stock a été réapprovisionné de +${quantiteAjoutee} ${produitExistant.unite || 'kg'}. Nouveau stock total : ${nouveauStock} ${produitExistant.unite || 'kg'}.`);

      this.resetForm();
      return;
    }

    // Sauvegarde API
    const formData = new FormData();
    formData.append('nom', this.nouveauProduit.nom);
    formData.append('prix', this.nouveauProduit.prix.toString());
    formData.append('stock', this.nouveauProduit.stock.toString());
    formData.append('unite', this.nouveauProduit.unite);
    formData.append('categorie_id', '1');
    formData.append('photo', this.nouveauProduit.image);
    if (this.nouveauProduit.description) {
      formData.append('description', this.nouveauProduit.description);
    }

    this.afficherModalForm = false;

    this.produitService.creerProduit(formData).subscribe({
      next: () => {
        this.chargerDashboardData();
      },
      error: (err: any) => {
        const msg = err.error?.message || "Impossible de publier la récolte (compte en attente ou non autorisé).";
        alert(`❌ ${msg}`);
      }
    });

    this.resetForm();
  }

  reapprovisionnerStock(produit: any) {
    const qteStr = prompt(`Quantité à ajouter au stock de "${produit.nom}" (en ${produit.unite || 'kg'}) :`, '50');
    if (qteStr !== null) {
      const qte = parseInt(qteStr.trim(), 10);
      if (!isNaN(qte) && qte > 0) {
        const nouveauStock = Number(produit.stock) + qte;
        produit.stock = nouveauStock;

        this.produitService.modifierProduit(produit.id, { stock: nouveauStock }).subscribe({
          next: () => {
            this.chargerDashboardData();
          },
          error: () => {}
        });

        alert(`✓ Le stock de "${produit.nom}" a été augmenté avec succès (+${qte} ${produit.unite || 'kg'}). Nouveau stock : ${nouveauStock} ${produit.unite || 'kg'}.`);
      }
    }
  }

  resetForm() {
    this.nouveauProduit = {
      nom: '',
      nomLocal: '',
      region: 'Thiès',
      prix: 1000,
      unite: 'kg',
      stock: 100,
      categorie: 'Légumes',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop',
      description: 'Récolte fraîche du jour au Sénégal, sans produits chimiques nocifs.',
    };
  }

  supprimerProduit(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.produits = this.produits.filter(p => p.id !== id);
      this.stats.produits = this.produits.length;
      this.produitService.supprimerProduit(id).subscribe({
        next: () => {
          this.chargerDashboardData();
        },
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
