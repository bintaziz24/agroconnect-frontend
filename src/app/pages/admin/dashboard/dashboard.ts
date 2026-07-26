import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private apiUrl = 'http://127.0.0.1:8000/api';

  user: any = null;
  menuActif = 'dashboard';

  stats = {
    utilisateurs: 1248,
    agriculteurs: 312,
    commandes: 847,
    revenus: 4250000,
  };

  agriculteurs = [
    { id: 1, nom: 'Mamadou Diallo',   localisation: 'Thiès',       email: 'mamadou@test.com', statut: 'validé',     image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop' },
    { id: 2, nom: 'Fatou Seck',       localisation: 'Dakar',       email: 'fatou@test.com',   statut: 'en_attente', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop' },
    { id: 3, nom: 'Ibrahima Bâ',      localisation: 'Saint-Louis', email: 'ib@test.com',      statut: 'en_attente', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop' },
    { id: 4, nom: 'Aïssatou Ndiaye',  localisation: 'Mbour',       email: 'ais@test.com',     statut: 'validé',     image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop' },
    { id: 5, nom: 'Oumar Sy',         localisation: 'Ziguinchor',  email: 'oumar@test.com',   statut: 'rejeté',     image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop' },
  ];

  commandes = [
    { id: 101, client: 'Cheikh Fall',    produit: 'Carottes 3kg', montant: 1500, statut: 'livré',      date: '25/06/2025' },
    { id: 102, client: 'Marie Dione',    produit: 'Oignons 5kg',  montant: 1750, statut: 'en_route',   date: '25/06/2025' },
    { id: 103, client: 'Aliou Mbaye',    produit: 'Tomates 2kg',  montant: 1600, statut: 'en_attente', date: '24/06/2025' },
    { id: 104, client: 'Rokhaya Ndiaye', produit: 'Mangues 3kg',  montant: 3600, statut: 'livré',      date: '24/06/2025' },
    { id: 105, client: 'Seydou Diop',    produit: 'Laitue x5',    montant: 1250, statut: 'annulé',     date: '23/06/2025' },
  ];

  statsUtilisateurs = [
    { label: 'Clients',      pct: 65, couleur: '#1B5EA6' },
    { label: 'Agriculteurs', pct: 25, couleur: '#1A7C4F' },
    { label: 'Livreurs',     pct: 10, couleur: '#E8A020' },
  ];

  statsCommandes = [
    { label: 'Livrés',      pct: 72, couleur: '#1A7C4F' },
    { label: 'En transit',  pct: 15, couleur: '#1B5EA6' },
    { label: 'En attente',  pct: 10, couleur: '#E8A020' },
    { label: 'Annulés',     pct: 3,  couleur: '#CC3333' },
  ];

  revenus = [
    { mois: 'Jan', val: 280000, h: 40 },
    { mois: 'Fév', val: 350000, h: 50 },
    { mois: 'Mar', val: 420000, h: 60 },
    { mois: 'Avr', val: 390000, h: 56 },
    { mois: 'Mai', val: 510000, h: 73 },
    { mois: 'Jun', val: 480000, h: 69 },
    { mois: 'Jul', val: 620000, h: 89 },
    { mois: 'Aoû', val: 580000, h: 83 },
    { mois: 'Sep', val: 710000, h: 100 },
    { mois: 'Oct', val: 650000, h: 93 },
    { mois: 'Nov', val: 590000, h: 85 },
    { mois: 'Déc', val: 750000, h: 100 },
  ];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.chargerDonneesBackend();

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.menuActif = params['tab'];
      } else {
        this.menuActif = 'dashboard';
      }
    });
  }

  chargerDonneesBackend() {
    this.http.get<any>(`${this.apiUrl}/admin/statistiques`).subscribe({
      next: (data) => {
        if (data) {
          this.stats.utilisateurs = data.utilisateurs || this.stats.utilisateurs;
          this.stats.agriculteurs = data.agriculteurs || this.stats.agriculteurs;
          this.stats.commandes = data.commandes || this.stats.commandes;
          this.stats.revenus = data.revenus || this.stats.revenus;
        }
      },
      error: () => {}
    });

    this.http.get<any[]>(`${this.apiUrl}/admin/utilisateurs`).subscribe({
      next: (list) => {
        if (Array.isArray(list) && list.length > 0) {
          this.agriculteurs = list.map(u => ({
            id: u.id,
            nom: u.name,
            localisation: u.localisation || 'Sénégal',
            email: u.email,
            statut: u.statut_validation || 'en_attente',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop'
          }));
        }
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
    return styles[statut] || '';
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
    return labels[statut] || statut;
  }

  validerAgriculteur(id: number) {
    const agri = this.agriculteurs.find(a => a.id === id);
    if (agri) agri.statut = 'validé';

    this.http.put(`${this.apiUrl}/admin/valider/${id}`, { statut: 'validé' }).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  rejeterAgriculteur(id: number) {
    const agri = this.agriculteurs.find(a => a.id === id);
    if (agri) agri.statut = 'rejeté';

    this.http.put(`${this.apiUrl}/admin/valider/${id}`, { statut: 'rejeté' }).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/';
    });
  }
}