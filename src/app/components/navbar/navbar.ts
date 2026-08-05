import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PanierService } from '../../services/panier';
import { TranslationService } from '../../services/translation';
import { NotificationService, AppNotification } from '../../services/notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  user: any = null;
  cartCount = 0;
  showNotifications = false;
  showChat = false;
  chatMessages: any[] = [];
  nouveauMessage = '';

  theme: 'light' | 'dark' = 'light';

  notificationsCount = 0;
  notifications: AppNotification[] = [];

  constructor(
    private authService: AuthService,
    private panierService: PanierService,
    private notificationService: NotificationService,
    private router: Router,
    public trans: TranslationService
  ) {}

  t(key: string): string {
    return this.trans.translate(key);
  }

  changeLang(lang: string) {
    this.trans.setLanguage(lang);
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = (savedTheme === 'dark' || (!savedTheme && prefersDark)) ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', this.theme);
    }

    this.authService.user$.subscribe((user: any) => {
      this.user = user;
      this.isLoggedIn = !!user;
    });

    this.panierService.items$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.quantite, 0);
    });

    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.notificationsCount = count;
    });
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showChat = false;
  }

  toggleChat(event: Event) {
    event.stopPropagation();
    this.showChat = !this.showChat;
    if (this.showChat) this.showNotifications = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.showNotifications = false;
    }
    if (!target.closest('.chat-container')) {
      this.showChat = false;
    }
  }

  @HostListener('window:nouvelle-commande', ['$event'])
  onNouvelleCommande(event: any) {
    const detail = event?.detail;
    this.notificationService.ajouterNotification({
      icon: '🛍️',
      titre: `Nouvelle Commande #${detail?.id || 'AGC-' + Math.floor(1000 + Math.random() * 9000)}`,
      temps: 'À l\'instant',
      message: `Commande validée pour un montant de ${detail?.montant_total || 'récolte locale'} FCFA.`
    });
  }

  marquerToutCommeLu() {
    this.notificationService.marquerToutCommeLu();
  }

  marquerCommeLu(notification: AppNotification) {
    this.notificationService.marquerCommeLu(notification.id);
  }

  supprimerNotification(id: number, event: Event) {
    event.stopPropagation();
    this.notificationService.supprimerNotification(id);
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', this.theme);
      localStorage.setItem('theme', this.theme);
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  selectRole(targetRole: string) {
    if (targetRole === 'public') {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/']);
      });
      return;
    }


    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const currentRole = this.user?.role;

    if (targetRole === 'client') {
      if (currentRole === 'client' || currentRole === 'admin') {
        this.router.navigate(['/catalogue']);
      } else {
        alert(`Vous êtes actuellement connecté en tant que ${currentRole || 'autre rôle'}. Veuillez vous déconnecter pour vous connecter avec un compte Client.`);
      }
    } else if (targetRole === 'agriculteur') {
      if (currentRole === 'agriculteur' || currentRole === 'admin') {
        this.router.navigate(['/agriculteur/dashboard']);
      } else {
        alert(`Accès refusé : Vous êtes connecté avec un compte ${currentRole}. Pour accéder à l'espace Agriculteur, veuillez vous déconnecter.`);
      }
    } else if (targetRole === 'admin') {
      if (currentRole === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        alert(`Accès refusé : L'espace d'administration est réservé aux administrateurs.`);
      }
    } else if (targetRole === 'livreur') {
      if (currentRole === 'livreur' || currentRole === 'admin') {
        this.router.navigate(['/livreur/dashboard']);
      } else {
        alert(`Accès refusé : Vous êtes connecté avec un compte ${currentRole}. Pour accéder à l'espace Livreur, veuillez vous déconnecter.`);
      }
    }
  }

  genererReponseAssistance(texte: string): string {
    const query = texte.toLowerCase();

    if (query.includes('numero') || query.includes('numéro') || query.includes('commercial') || query.includes('telephone') || query.includes('téléphone') || query.includes('contact') || query.includes('joindre') || query.includes('appel')) {
      return `📞 Service Commercial & Assistance AgroConnect :\n• Ligne directe / WhatsApp : +221 77 800 00 00\n• Fixe Commercial : +221 33 800 00 00\n• E-mail : commercial@agroconnect.sn\n• Horaires : 7j/7 de 08h00 à 20h00.`;
    }

    if (query.includes('commande') || query.includes('suivi') || query.includes('livraison') || query.includes('colis') || query.includes('statut')) {
      return `📦 Suivi de Commande & Livraison :\nConsultez l'onglet "Historique de mes commandes" dans votre espace personnel. Nos livreurs vous livrent en moins de 24h à Dakar, Thiès et en régions.`;
    }

    if (query.includes('wave') || query.includes('orange') || query.includes('free') || query.includes('payer') || query.includes('paiement') || query.includes('espece') || query.includes('espèce')) {
      return `💳 Modes de Paiement Acceptés :\n• Wave Mobile Money\n• Orange Money (OM)\n• Paiement en espèces à la livraison à la réception des produits.`;
    }

    if (query.includes('prix') || query.includes('produit') || query.includes('legume') || query.includes('légume') || query.includes('fruit') || query.includes('bio') || query.includes('tarif')) {
      return `🌾 Produits Direct Producteur :\nTous nos fruits et légumes proviennent directement des récoltes locales (Niayes, Vallée du fleuve, Casamance). Rendez-vous sur la page Catalogue pour consulter les stocks et prix en temps réel.`;
    }

    if (query.includes('bonjour') || query.includes('salam') || query.includes('salut') || query.includes('coucou') || query.includes('hello')) {
      return `Bonjour ! Bienvenue sur l'assistance en ligne AgroConnect 🌾. Comment pouvons-nous vous guider aujourd'hui ?`;
    }

    return `Merci pour votre message ! Notre équipe commerciale est disponible en direct au +221 77 800 00 00 (WhatsApp) ou par mail à commercial@agroconnect.sn. En quoi d'autre pouvons-nous vous aider ?`;
  }

  envoyerMessage(event: Event) {
    event.preventDefault();
    if (!this.nouveauMessage.trim()) return;

    const texteMessage = this.nouveauMessage.trim();

    this.chatMessages.push({
      texte: texteMessage,
      estMe: true,
      auteur: this.user ? this.user.name : 'Moi',
      heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.nouveauMessage = '';

    setTimeout(() => {
      const reponse = this.genererReponseAssistance(texteMessage);
      this.chatMessages.push({
        texte: reponse,
        estMe: false,
        auteur: 'Assistance AgroConnect',
        heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 300);
  }
}