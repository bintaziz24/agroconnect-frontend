import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande';

import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './commandes.html',
  styleUrl: './commandes.scss'
})
export class CommandesComponent implements OnInit {
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

  chatMessages = [
    { auteur: 'Khadija Sy', role: 'CUSTOMER', temps: '10:35 AM', texte: 'Bonjour Mamadou, est-ce que les mangues sont bien fraîches de ce matin ?', estMe: true },
    { auteur: 'Mamadou Sow', role: 'FARMER', temps: '10:38 AM', texte: 'Bonjour Khadija ! Oui, récoltées hier après-midi à Ziguinchor, conditionnées sous caisse alvéolée fraîcheur.', estMe: false },
    { auteur: 'Ibrahima Faye', role: 'DRIVER', temps: '12:42 PM', texte: 'Salam Khadija ! Je viens de récupérer le colis au dépôt de Fann. Je serai chez vous dans environ 30-35 minutes.', estMe: false }
  ];

  constructor(private commandeService: CommandeService) {}

  ngOnInit() {
    this.chargerCommandes();
  }

  chargerCommandes() {
    this.commandeService.getMesCommandes().subscribe({
      next: (res) => {
        this.commandes = Array.isArray(res) ? res : (res.data || []);
        this.filtrerCommandes();
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
      }
    });
  }

  ouvrirChat(cmd: any) {
    this.commandeSelectionnee = cmd;
    this.modalChatOuvert = true;
  }

  fermerChat() {
    this.modalChatOuvert = false;
  }

  envoyerMessage(texte?: string) {
    const msg = texte || this.messageSaisi;
    if (!msg.trim()) return;

    this.chatMessages.push({
      auteur: 'Khadija Sy',
      role: 'CUSTOMER',
      temps: 'Maintenant',
      texte: msg,
      estMe: true
    });
    if (!texte) this.messageSaisi = '';
  }

  ouvrirSuivi(cmd: any) {
    this.commandeSelectionnee = cmd;
    this.modalSuiviOuvert = true;
    this.progressPourcentage = 15;

    // Simulation du déplacement du livreur sur la carte
    if (this.timerSimulation) clearInterval(this.timerSimulation);
    this.timerSimulation = setInterval(() => {
      if (this.progressPourcentage < 85) {
        this.progressPourcentage += 8;
      } else {
        this.progressPourcentage = 85;
        clearInterval(this.timerSimulation);
      }
    }, 2500);
  }

  fermerSuivi() {
    this.modalSuiviOuvert = false;
    if (this.timerSimulation) clearInterval(this.timerSimulation);
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

  suivreDirect(commande: any) {
    alert(`Suivi en temps réel de la commande #${commande.id} : Votre livreur est en route !`);
  }
}
