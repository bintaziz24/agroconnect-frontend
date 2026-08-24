import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PanierService } from '../../services/panier';
import { TranslationService } from '../../services/translation';
import { NotificationService, AppNotification } from '../../services/notification';
import { DiscussionService } from '../../services/discussion';

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
  unreadChatCount = 0;
  previousUnreadChatCount = -1;
  nouveauMessageToast = false;
  toastMessageText = '';

  constructor(
    private authService: AuthService,
    private panierService: PanierService,
    private notificationService: NotificationService,
    private discussionService: DiscussionService,
    private router: Router,
    public trans: TranslationService,
    private cdr: ChangeDetectorRef
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
      if (this.isLoggedIn) {
        this.chargerUnreadChatCount();
      }
    });

    // Rafraîchir périodiquement le compteur de messages non lus (badge rouge & alertes)
    setInterval(() => {
      if (this.isLoggedIn) {
        this.chargerUnreadChatCount();
      }
    }, 4000);

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

  chargerUnreadChatCount() {
    this.discussionService.getNombreMessagesNonLus().subscribe({
      next: (res) => {
        const count = res?.non_lus || 0;
        if (this.previousUnreadChatCount >= 0 && count > this.previousUnreadChatCount) {
          this.nouveauMessageToast = true;
          this.toastMessageText = `Vous avez reçu un nouveau message ! (${count} non lu${count > 1 ? 's' : ''})`;
          this.playNotificationSound();
          this.triggerNativeNotification('💬 Nouveau Message AgroConnect', this.toastMessageText);
          setTimeout(() => {
            this.nouveauMessageToast = false;
            this.cdr.detectChanges();
          }, 6500);
        }
        this.previousUnreadChatCount = count;
        this.unreadChatCount = count;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  ouvrirChatNotification(): void {
    this.nouveauMessageToast = false;
    this.router.navigate(['/chat']);
  }

  private playNotificationSound(): void {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {}
  }

  private triggerNativeNotification(title: string, body: string): void {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/assets/logo.png' });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(title, { body, icon: '/assets/logo.png' });
            }
          });
        }
      }
    } catch (e) {}
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
    if (!target.closest('.chat-container') && !target.closest('.modal')) {
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

  showProfilModal = false;

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  ouvrirProfil() {
    this.showProfilModal = true;
  }

  fermerProfil() {
    this.showProfilModal = false;
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
      return `📞 Service Commercial & Assistance WhatsApp AgroConnect :\n• Téléphone & WhatsApp Commercial : +221 76 551 29 74\n• E-mail officiel : contact@agroconnect.sn\n• Assistance en ligne : Disponible 24h/24 via ce chat\n• Horaires de réponse : 7j/7 de 08h00 à 20h00.`;
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

  scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('chat-navbar-body');
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  envoyerMessage(event?: Event, texteRapide?: string) {
    if (event) event.preventDefault();
    const texteMessage = (texteRapide || this.nouveauMessage || '').trim();
    if (!texteMessage) return;

    this.chatMessages.push({
      texte: texteMessage,
      estMe: true,
      auteur: this.user ? this.user.name : 'Moi',
      heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (!texteRapide) this.nouveauMessage = '';
    this.cdr.detectChanges();
    this.scrollToBottom();

    setTimeout(() => {
      const reponse = this.genererReponseAssistance(texteMessage);
      this.chatMessages.push({
        texte: reponse,
        estMe: false,
        auteur: 'Assistance AgroConnect',
        heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.cdr.detectChanges();
      this.scrollToBottom();
    }, 350);
  }
}