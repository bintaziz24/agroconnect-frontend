import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande';
import { AuthService } from '../../services/auth';
import { ChatService, ChatMessage } from '../../services/chat';
import { TranslatePipe } from '../../pipes/translate.pipe';

declare var L: any;

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './commandes.html',
  styleUrl: './commandes.scss'
})
export class CommandesComponent implements OnInit {
  user: any = null;
  commandes: any[] = [];
  commandesFiltrees: any[] = [];
  ongletActif: 'toutes' | 'en_cours' | 'livrees' = 'toutes';
  chargement = true;

  modalChatOuvert = false;
  modalSuiviOuvert = false;
  commandeSelectionnee: any = null;
  messageSaisi = '';
  progressPourcentage = 15;
  timerSimulation: any = null;

  chatMessages: (ChatMessage & { estMe?: boolean })[] = [];

  constructor(
    private commandeService: CommandeService,
    private authService: AuthService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  chatSubscription: any = null;

  getMissionId(cmd?: any): string {
    const target = cmd || this.commandeSelectionnee || (this.commandes && this.commandes[0]);
    if (!target || !target.id) return 'AGC-9021';
    const strId = String(target.id);
    return strId.startsWith('AGC-') ? strId : 'AGC-' + strId;
  }

  chargerChat(missionId: string) {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
    this.chatSubscription = this.chatService.getMessagesObservable(missionId).subscribe((list) => {
      const currentUserName = this.user?.name || this.user?.nom || '';
      this.chatMessages = list.map(msg => ({
        ...msg,
        estMe: msg.role === 'CUSTOMER' || (currentUserName && msg.auteur.includes(currentUserName))
      }));
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.chargerCommandes();

    this.chargerChat(this.getMissionId());

    // Synchronisation en temps réel du statut lors de la confirmation par le livreur
    window.addEventListener('storage', (e) => {
      if (!e.key || e.key === 'agroconnect_status_AGC-9021') {
        this.chargerCommandes();
      }
    });
  }

  chargerCommandes() {
    this.commandeService.getMesCommandes().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        this.commandes = data;
        this.filtrerCommandes();
        this.chargement = false;
        if (this.commandes.length > 0) {
          this.chargerChat(this.getMissionId(this.commandes[0]));
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.commandes = [];
        this.filtrerCommandes();
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  private getMockCommandes() {
    const savedStatus = localStorage.getItem('agroconnect_status_AGC-9021');
    const status9021 = savedStatus === 'livree' ? 'livree' : (savedStatus === 'refusee' ? 'annulee' : 'en_cours');

    return [
      {
        id: '9021',
        statut: status9021,
        created_at: new Date().toISOString(),
        montant_total: 18500,
        livraison: {
          adresse: 'Villa 142, Sacré-Cœur 3, Dakar',
          ville: 'Dakar'
        },
        paiement: {
          mode_paiement: 'wave'
        },
        lignes_commande: [
          {
            quantite: 5,
            prix_unitaire: 2500,
            produit: {
              nom: 'Mangues Bio de Ziguinchor',
              unite: 'kg',
              photo: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300',
              agriculteur: {
                localisation: 'Ziguinchor',
                user: { name: 'Mamadou Sow (Ferme Vallée Bio)' }
              }
            }
          },
          {
            quantite: 3,
            prix_unitaire: 2000,
            produit: {
              nom: 'Papayes Solo Bio',
              unite: 'kg',
              photo: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=300',
              agriculteur: {
                localisation: 'Ziguinchor',
                user: { name: 'Mamadou Sow (Ferme Vallée Bio)' }
              }
            }
          }
        ]
      },
      {
        id: '7719',
        statut: 'livree',
        created_at: '2026-07-28T10:15:00Z',
        montant_total: 12000,
        livraison: {
          adresse: 'Villa 142, Sacré-Cœur 3, Dakar',
          ville: 'Dakar'
        },
        paiement: {
          mode_paiement: 'orange_money'
        },
        lignes_commande: [
          {
            quantite: 10,
            prix_unitaire: 1200,
            produit: {
              nom: 'Riz Parfumé Vallée de Saint-Louis',
              unite: 'kg',
              photo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
              agriculteur: {
                localisation: 'Saint-Louis',
                user: { name: 'Cheikh Ndiaye (Riziculture)' }
              }
            }
          }
        ]
      }
    ];
  }

  ouvrirChat(cmd: any) {
    this.commandeSelectionnee = cmd;
    this.modalChatOuvert = true;
    const missionId = this.getMissionId(cmd);
    this.chargerChat(missionId);
  }

  fermerChat() {
    this.modalChatOuvert = false;
  }

  envoyerMessage(texte?: string) {
    const msg = texte || this.messageSaisi;
    if (!msg.trim()) return;

    const missionId = this.getMissionId();
    const currentName = this.user?.name || this.user?.nom || 'Client';
    const authorName = currentName.includes('Client') ? currentName : `${currentName} (Client)`;

    this.chatService.sendMessage(missionId, authorName, 'CUSTOMER', msg.trim());
    if (!texte) this.messageSaisi = '';
    this.cdr.detectChanges();
  }

  ouvrirSuivi(cmd: any) {
    this.commandeSelectionnee = cmd;
    this.modalSuiviOuvert = true;
    this.progressPourcentage = 39;

    this.initSuiviMap();
  }

  private initSuiviMap() {
    setTimeout(() => {
      const container = document.getElementById('client-suivi-map');
      if (!container || typeof L === 'undefined') return;

      container.innerHTML = '';

      const producerPos: [number, number] = [14.7910, -16.9255]; // Thiès
      const clientPos: [number, number] = [14.7176, -17.4674];   // Villa 142, Sacré-Cœur 3, Dakar
      const livreurPos: [number, number] = [14.7550, -17.1800];  // En route (Rufisque)

      const map = L.map('client-suivi-map').setView([14.7500, -17.2000], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      L.marker(producerPos).addTo(map)
        .bindPopup('<b>🌾 Point d Enlèvement</b><br>Mamadou Sow (Thiès)');

      L.marker(clientPos).addTo(map)
        .bindPopup('<b>🏠 Votre Adresse (Client)</b><br>Villa 142, Sacré-Cœur 3, Dakar')
        .openPopup();

      L.marker(livreurPos).addTo(map)
        .bindPopup('<b>🚚 Livreur Express</b><br>En route vers chez vous (~35 min)');

      const routeWaypoints = [
        producerPos,
        [14.7800, -17.0000],
        [14.7650, -17.1000],
        livreurPos,
        [14.7300, -17.3500],
        clientPos
      ];

      L.polyline(routeWaypoints, {
        color: '#1A7C4F',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(map);
    }, 300);
  }

  fermerSuivi() {
    this.modalSuiviOuvert = false;
  }

  changerOnglet(onglet: 'toutes' | 'en_cours' | 'livrees') {
    this.ongletActif = onglet;
    this.filtrerCommandes();
  }

  filtrerCommandes() {
    if (this.ongletActif === 'toutes') {
      this.commandesFiltrees = this.commandes;
    } else if (this.ongletActif === 'en_cours') {
      this.commandesFiltrees = this.commandes.filter(c => 
        ['en_attente', 'preparation', 'expediee', 'en_cours'].includes(c.statut)
      );
    } else if (this.ongletActif === 'livrees') {
      this.commandesFiltrees = this.commandes.filter(c => c.statut === 'livree');
    }
  }

  getStatusText(statut: string): string {
    const texts: Record<string, string> = {
      'en_attente': 'En attente',
      'preparation': 'Préparation',
      'expediee': 'Expédiée',
      'en_cours': 'En cours de livraison',
      'livree': 'Livrée avec succès',
      'annulee': 'Annulée'
    };
    return texts[statut] || statut;
  }

  getStatusClass(statut: string): string {
    if (statut === 'livree') return 'badge-livree';
    if (['en_attente', 'preparation'].includes(statut)) return 'badge-attente';
    if (statut === 'annulee') return 'badge-annulee';
    return 'badge-encours';
  }

  getStatusIcon(statut: string): string {
    if (statut === 'livree') return '✅';
    if (['en_attente', 'preparation'].includes(statut)) return '⏰';
    if (statut === 'annulee') return '❌';
    return '🚚';
  }

  getPaymentText(commande: any): string {
    const mode = commande.paiement?.mode_paiement || 'Wave';
    return mode.toUpperCase();
  }

  getNomAgriculteur(cmd: any): string {
    if (!cmd) return 'Mamadou Sow (Ferme Vallée Bio)';

    if (cmd.agriculteur_nom) return cmd.agriculteur_nom;
    if (cmd.agriculteur?.name) return cmd.agriculteur.name;
    if (cmd.agriculteur?.nom) return cmd.agriculteur.nom;
    if (cmd.producteur_nom) return cmd.producteur_nom;

    const firstLine = cmd.lignes_commande?.[0];
    if (firstLine?.produit?.agriculteur) {
      const agr = firstLine.produit.agriculteur;
      if (agr.user?.name) return agr.user.name;
      if (agr.user?.nom) return agr.user.nom;
      if (agr.nom_ferme) return agr.nom_ferme;
      if (agr.nom) return agr.nom;
      if (typeof agr === 'string') return agr;
    }

    if (String(cmd.id).includes('9021')) return 'Mamadou Sow (Ferme Vallée Bio)';
    if (String(cmd.id).includes('7719')) return 'Cheikh Ndiaye (Riziculture Saint-Louis)';

    return 'Mamadou Sow (Ferme Vallée Bio)';
  }

  getLocalisationAgriculteur(cmd: any): string {
    const firstLine = cmd?.lignes_commande?.[0];
    if (firstLine?.produit?.agriculteur?.localisation) {
      return firstLine.produit.agriculteur.localisation;
    }
    if (cmd?.agriculteur_localisation) return cmd.agriculteur_localisation;
    if (String(cmd?.id).includes('9021')) return 'Ziguinchor';
    if (String(cmd?.id).includes('7719')) return 'Saint-Louis';
    return 'Ziguinchor, Sénégal';
  }

  suivreDirect(commande: any) {
    alert(`Suivi en temps réel de la commande #${commande.id} : Votre livreur est en route !`);
  }

  getNomLivreur(cmd: any): string {
    if (!cmd) return 'En cours d\'assignation...';
    if (cmd.livraison?.livreur?.name) {
      return cmd.livraison.livreur.name + ' (Livreur Express)';
    }
    if (cmd.livraison?.livreur?.nom) {
      return cmd.livraison.livreur.nom + ' (Livreur Express)';
    }
    if (cmd.livreur_nom) return cmd.livreur_nom;
    if (cmd.livraison?.livreur_id) {
      return 'Livreur Express #' + cmd.livraison.livreur_id;
    }
    if (String(cmd.id).includes('9021')) return 'Babacar Fall (Express Dakar-Express)';
    return 'Livreur Express (En cours d\'attribution)';
  }

  getTelephoneLivreur(cmd: any): string {
    if (!cmd) return '+221 77 000 00 00';
    if (cmd.livraison?.livreur?.telephone) {
      return cmd.livraison.livreur.telephone;
    }
    if (cmd.livreur_phone) return cmd.livreur_phone;
    return '+221 77 123 45 67';
  }

  isStepCompleted(cmd: any, step: number): boolean {
    const st = cmd?.statut || 'en_cours';
    if (st === 'livree') return true;
    if (st === 'en_cours' || st === 'expediee') return step <= 4;
    if (st === 'preparation' || st === 'validee') return step <= 2;
    if (st === 'en_attente') return step <= 1;
    return step <= 4;
  }

  isStepActive(cmd: any, step: number): boolean {
    const st = cmd?.statut || 'en_cours';
    if (st === 'livree') return false;
    if (st === 'en_cours' || st === 'expediee') return step === 5;
    if (st === 'preparation' || st === 'validee') return step === 3;
    if (st === 'en_attente') return step === 2;
    return step === 5;
  }
}
