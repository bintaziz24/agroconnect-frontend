import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-livreur-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  user: any = null;
  menuActif = 'missions';
  livraisonConfirmee = false;

  stats = {
    weeklyGains: 143300,
    coursesHonorees: 58,
    ponctualite: '99.2%',
    gainMoyen: 2471,
    performanceBonus: 15000,
  };

  missions = [
    {
      id: 'AGC-9021',
      statut: 'En cours de livraison',
      origine: 'Mamadou Sow (Ferme Vallée Bio)',
      origineRegion: 'Ziguinchor',
      originePhone: '+221 77 654 32 10',
      destinataire: 'Khadija Sy',
      destinataireAdresse: 'Villa 142, Sacré-Cœur 3, Dakar',
      destinatairePhone: '+221 77 111 22 33',
      gain: 2000,
      parcoursPct: 39,
    }
  ];

  historiqueGains = [
    { jour: 'Lun', val: 18000, h: 60 },
    { jour: 'Mar', val: 24000, h: 80 },
    { jour: 'Mer', val: 22000, h: 73 },
    { jour: 'Jeu', val: 28000, h: 93 },
    { jour: 'Ven', val: 30000, h: 100 },
    { jour: 'Sam', val: 15000, h: 50 },
    { jour: 'Dim', val: 6300,  h: 21 },
  ];

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.menuActif = params['tab'];
      } else {
        this.menuActif = 'missions';
      }
    });
  }

  confirmerLivraison() {
    this.livraisonConfirmee = true;
    this.missions[0].statut = 'Livrée avec succès';
    this.stats.weeklyGains += 2000;
    this.stats.coursesHonorees += 1;
  }
}
