import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private apiUrl = environment.apiUrl;

  user: any = null;
  menuActif = 'dashboard';

  stats = {
    utilisateurs: 0,
    agriculteurs: 0,
    livreurs: 0,
    commandes: 0,
    revenus: 0,
    commissions: 0,
    validations_en_attente: 0,
    produits: 0
  };

  agriculteurs: any[] = [];
  livreurs: any[] = [];
  commandes: any[] = [];
  produitsModeration: any[] = [];
  chargementProduits = false;
  roleFiltre: string = 'tous';

  get agriculteursFiltres(): any[] {
    if (!this.roleFiltre || this.roleFiltre === 'tous') {
      return this.agriculteurs;
    }
    return this.agriculteurs.filter(a => a.role === this.roleFiltre);
  }

  get totalAgriculteursCount(): number {
    return this.agriculteurs.filter(a => a.role === 'agriculteur').length;
  }

  get totalClientsCount(): number {
    return this.agriculteurs.filter(a => a.role === 'client').length;
  }

  get totalLivreursCount(): number {
    return this.agriculteurs.filter(a => a.role === 'livreur').length;
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.chargerDonneesBackend();

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.menuActif = params['tab'];
      }
      this.cdr.detectChanges();
    });
  }

  changerOnglet(tab: string, roleFiltre: string = 'tous') {
    this.menuActif = tab;
    if (roleFiltre) {
      this.roleFiltre = roleFiltre;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
    this.cdr.detectChanges();
  }

  chargerDonneesBackend() {
    // Statistiques globales
    this.http.get<any>(`${this.apiUrl}/admin/statistiques`).subscribe({
      next: (data) => {
        if (data) {
          this.stats = {
            utilisateurs: data.utilisateurs || 0,
            agriculteurs: data.agriculteurs || 0,
            livreurs: data.livreurs || 0,
            commandes: data.commandes || 0,
            revenus: data.revenus || 0,
            commissions: data.commissions || (data.revenus ? roundVal(data.revenus * 0.05) : 0),
            validations_en_attente: data.validations_en_attente || 0,
            produits: data.produits || 0
          };
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });

    // Liste des utilisateurs
    this.http.get<any[]>(`${this.apiUrl}/admin/utilisateurs`).subscribe({
      next: (list) => {
        if (Array.isArray(list)) {
          this.agriculteurs = list.map(u => ({
            id: u.id,
            nom: u.name,
            role: u.role || 'client',
            localisation: u.agriculteur?.localisation || u.localisation || u.region || 'Sénégal',
            email: u.email,
            telephone: u.telephone || '',
            statut: u.statut_validation || (u.agriculteur ? u.agriculteur.statut_validation : null) || (['agriculteur', 'livreur'].includes(u.role) ? 'en_attente' : 'validé'),
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop'
          }));

          // Mapping livreurs
          const registeredLivreurs = list
            .filter(u => u.role === 'livreur')
            .map(u => ({
              id: u.id,
              nom: u.name,
              telephone: u.telephone ? (u.telephone.startsWith('+221') ? u.telephone : '+221 ' + u.telephone) : '+221 77 000 00 00',
              vehicule: 'Moto Cargo Express',
              zone: u.localisation || 'Dakar & Régions',
              statut: u.statut_validation === 'validé' ? 'disponible' : (u.statut_validation === 'rejeté' ? 'hors_ligne' : 'en_attente'),
              gainsJour: 0,
              coursesTotal: 0,
              note: '5.0 ⭐ (Nouveau)'
            }));

          this.livreurs = registeredLivreurs;
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });

    // Produits à modérer
    this.chargementProduits = true;
    this.http.get<any[]>(`${this.apiUrl}/admin/produits`).subscribe({
      next: (list) => {
        this.chargementProduits = false;
        if (Array.isArray(list)) {
          this.produitsModeration = list;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.chargementProduits = false;
        this.cdr.detectChanges();
      }
    });

    // Commandes récentes
    this.http.get<any[]>(`${this.apiUrl}/admin/commandes`).subscribe({
      next: (list) => {
        if (Array.isArray(list)) {
          this.commandes = list.slice(0, 5);
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  getStatutStyle(statut: string): string {
    const styles: any = {
      'validé':      'background:#E8F5EE;color:#0F5235',
      'en_attente':  'background:#FFF3DC;color:#B07820',
      'rejeté':      'background:#FCEBEB;color:#791F1F',
      'en_route':    'background:#E6F0FB;color:#0D3A6B',
      'livré':       'background:#E8F5EE;color:#0F5235',
      'annulé':      'background:#FCEBEB;color:#791F1F',
    };
    return styles[statut] || 'background:#E8F5EE;color:#0F5235';
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      'validé':      'Validé',
      'en_attente':  'En attente',
      'rejeté':      'Rejeté',
      'en_route':    'En transit',
      'livré':       'Livré',
      'annulé':      'Annulé',
    };
    return labels[statut] || statut || 'Validé';
  }

  validerAgriculteur(id: number) {
    const agri = this.agriculteurs.find(a => a.id === id);
    if (agri) agri.statut = 'validé';

    const liv = this.livreurs.find(l => l.id === id);
    if (liv) liv.statut = 'disponible';

    this.cdr.detectChanges();

    this.http.put(`${this.apiUrl}/admin/valider/${id}`, { statut: 'validé' }).subscribe({
      next: () => {
        this.chargerDonneesBackend();
      },
      error: () => {}
    });
  }

  rejeterAgriculteur(id: number) {
    const agri = this.agriculteurs.find(a => a.id === id);
    if (agri) agri.statut = 'rejeté';

    const liv = this.livreurs.find(l => l.id === id);
    if (liv) liv.statut = 'hors_ligne';

    this.cdr.detectChanges();

    this.http.put(`${this.apiUrl}/admin/valider/${id}`, { statut: 'rejeté' }).subscribe({
      next: () => {
        this.chargerDonneesBackend();
      },
      error: () => {}
    });
  }

  supprimerProduit(id: number) {
    if (confirm('Voulez-vous vraiment retirer ce produit de la plateforme ?')) {
      // Suppression optimiste immédiate dans l'interface
      this.produitsModeration = this.produitsModeration.filter(p => p.id !== id);
      this.stats.produits = Math.max(0, this.stats.produits - 1);
      this.cdr.detectChanges();

      this.http.delete(`${this.apiUrl}/admin/produits/${id}`).subscribe({
        next: () => {
          this.cdr.detectChanges();
        },
        error: () => {
          // Recharger en cas d'erreur backend pour restaurer l'état exact
          this.chargerDonneesBackend();
        }
      });
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/';
    });
  }
}

function roundVal(val: number): number {
  return Math.round(val * 100) / 100;
}