import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DiscussionService, Discussion, Message } from '../../services/discussion';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;

  discussions: Discussion[] = [];
  discussionActive: Discussion | null = null;
  messages: Message[] = [];
  nouveauMessage: string = '';
  currentUser: any = null;
  loadingDiscussions: boolean = true;
  loadingMessages: boolean = false;
  sendingMessage: boolean = false;
  searchFilter: string = '';
  selectedImage: string | null = null;

  // Polling interval pour rafraîchissement auto
  private pollingInterval: any = null;

  // Suggestions rapides pour la saisie
  quickReplies: string[] = [];

  getQuickReplies(): string[] {
    const role = this.currentUser?.role;

    if (role === 'agriculteur') {
      return [
        "Bonjour ! Oui, le produit est fraîchement récolté ce matin.",
        "Bonjour, nos prix pour commande en gros sont négociables.",
        "Bonjour ! La livraison est disponible sur Dakar et région.",
        "Bonjour, le stock est suffisant et prêt pour expédition."
      ];
    } else if (role === 'livreur') {
      return [
        "Bonjour, la commande est prête pour prise en charge.",
        "Bonjour ! Je suis actuellement en route pour la livraison.",
        "Bonjour, la livraison a été effectuée avec succès !"
      ];
    } else {
      return [
        "Bonjour, le produit est-il fraîchement récolté ?",
        "Quels sont vos prix pour une commande en gros volume ?",
        "Quelles sont les modalités de livraison à Dakar / Thies ?",
        "Pouvez-vous m'envoyer une photo du stock disponible ?"
      ];
    }
  }

  constructor(
    private discussionService: DiscussionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.chargerDiscussions();

    // Ecouter les changements de paramètres dans l'URL (/chat/:id)
    this.route.paramMap.subscribe(params => {
      const targetId = params.get('id');
      if (targetId) {
        this.chargerEtSelectionnerDiscussion(+targetId);
      }
    });

    // Démarrer le polling toutes les 4 secondes pour rafraîchir les messages
    this.pollingInterval = setInterval(() => {
      if (this.discussionActive) {
        this.rafraichirMessagesSilencieux();
      } else {
        this.chargerDiscussions(true);
      }
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  chargerDiscussions(silent: boolean = false): void {
    this.currentUser = this.authService.getCurrentUser();
    const local = this.discussionService.getLocalDiscussions();
    this.discussions = local || [];

    if (this.discussionActive && !this.discussions.some(d => String(d.id) === String(this.discussionActive?.id))) {
      this.discussions.unshift(this.discussionActive);
    }
    this.loadingDiscussions = false;

    const targetId = this.route.snapshot.paramMap.get('id');
    if (targetId) {
      this.chargerEtSelectionnerDiscussion(targetId);
    } else if (!this.discussionActive && this.discussions.length > 0 && typeof window !== 'undefined' && window.innerWidth > 768) {
      this.selectionnerDiscussion(this.discussions[0]);
    }

    this.discussionService.getDiscussions().subscribe({
      next: (data) => {
        if (data) {
          this.discussions = data;
          if (this.discussionActive && !this.discussions.some(d => String(d.id) === String(this.discussionActive?.id))) {
            this.discussions.unshift(this.discussionActive);
          }
        }
        this.loadingDiscussions = false;
      },
      error: (err) => {
        console.error('Erreur chargement discussions', err);
        this.loadingDiscussions = false;
      }
    });
  }

  chargerEtSelectionnerDiscussion(id: any): void {
    if (!id) return;
    const found = this.discussions.find(d => String(d.id) === String(id));
    if (found) {
      this.selectionnerDiscussion(found);
    } else {
      this.discussionService.getDiscussion(id).subscribe({
        next: (d) => {
          if (d) {
            if (!this.discussions.some(x => String(x.id) === String(d.id))) {
              this.discussions.unshift(d);
            }
            this.selectionnerDiscussion(d);
          }
        }
      });
    }
  }

  selectionnerDiscussion(discussion: Discussion): void {
    if (!discussion) return;
    this.discussionActive = discussion;

    if (discussion.messages && discussion.messages.length > 0) {
      this.messages = this.discussionService.deduplicateMessages(discussion.messages);
      this.loadingMessages = false;
      this.scrollToBottom();
    } else {
      this.loadingMessages = true;
    }

    // Récupérer le détail complémentaire de la discussion avec les messages
    this.discussionService.getDiscussion(discussion.id).subscribe({
      next: (data) => {
        if (data) {
          this.discussionActive = data;
          const rawMsgs = (data.messages && data.messages.length > 0) ? data.messages : (discussion.messages || []);
          this.messages = this.discussionService.deduplicateMessages(rawMsgs);
        }
        this.loadingMessages = false;
        discussion.non_lus_count = 0; // Réinitialiser le compteur local
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Erreur chargement messages', err);
        this.loadingMessages = false;
        this.messages = this.discussionService.deduplicateMessages(discussion.messages || []);
      }
    });
  }

  rafraichirMessagesSilencieux(): void {
    if (!this.discussionActive) return;
    this.discussionService.getDiscussion(this.discussionActive.id).subscribe({
      next: (data) => {
        if (data && data.messages && data.messages.length > 0) {
          const cleanMsgs = this.discussionService.deduplicateMessages(data.messages);
          if (cleanMsgs.length >= this.messages.length) {
            const prevCount = this.messages.length;
            this.messages = cleanMsgs;
            if (this.messages.length > prevCount) {
              this.scrollToBottom();
            }
          }
        }
      }
    });
  }

  envoyerMessage(): void {
    if ((!this.nouveauMessage.trim() && !this.selectedImage) || !this.discussionActive || this.sendingMessage) return;

    const texte = this.nouveauMessage.trim();
    const payload: any = {
      contenu: texte,
      type_message: this.selectedImage ? 'image' : 'texte',
      fichier_url: this.selectedImage || undefined
    };

    this.nouveauMessage = '';
    this.selectedImage = null;
    this.sendingMessage = true;

    this.discussionService.envoyerMessage(this.discussionActive.id, payload).subscribe({
      next: (msg) => {
        if (msg) {
          if (!this.messages.some(m => String(m.id) === String(msg.id))) {
            this.messages.push(msg);
          }
          if (this.discussionActive) {
            this.discussionActive.dernier_message = msg;
            this.discussionActive.dernier_message_at = new Date().toISOString();
          }
        }
        this.sendingMessage = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Erreur envoi message', err);
        this.sendingMessage = false;
      }
    });
  }

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  annulerImage(): void {
    this.selectedImage = null;
  }

  insererQuickReply(text: string): void {
    this.nouveauMessage = text;
  }

  getUnreadCount(d: Discussion): number {
    if (!d) return 0;
    if (this.discussionActive && String(this.discussionActive.id) === String(d.id)) {
      return 0;
    }
    if (d.messages && Array.isArray(d.messages)) {
      const unread = d.messages.filter(m => m && String(m.expediteur_id) !== String(this.currentUser?.id) && !m.est_lu);
      if (unread.length > 0) return unread.length;
    }
    return Number(d.non_lus_count) || 0;
  }

  getNomCorrespondant(discussion: Discussion): string {
    if (!discussion) return 'Utilisateur';
    const role = this.currentUser?.role;

    let nom = '';
    if (role === 'agriculteur') {
      nom = discussion.client?.name || 'Client AgroConnect';
    } else if (role === 'livreur') {
      nom = discussion.client?.name || discussion.agriculteur?.user?.name || discussion.produit?.agriculteur?.user?.name || 'Utilisateur';
    } else {
      nom = discussion.produit?.agriculteur?.user?.name || 
            discussion.produit?.agriculteur?.nom || 
            discussion.agriculteur?.user?.name || 
            discussion.agriculteur?.nom || 
            'Producteur Agricole';
    }

    if (!nom || nom === 'Moi' || nom === 'Moi (Acheteur)') {
      return role === 'agriculteur' ? 'Client AgroConnect' : (discussion.agriculteur?.user?.name || discussion.produit?.agriculteur?.user?.name || 'Producteur Agricole');
    }
    return nom;
  }

  getSenderName(msg: Message): string {
    if (!msg) return 'Correspondant';
    if (msg.expediteur_id === this.currentUser?.id) {
      return 'Vous';
    }
    const name = msg.expediteur?.name;
    if (!name || name === 'Moi' || name === 'Moi (Acheteur)') {
      return msg.expediteur?.role === 'agriculteur' ? 'Producteur Agricole' : 'Client AgroConnect';
    }
    return name;
  }

  getRoleCorrespondant(discussion: Discussion): string {
    if (!discussion) return 'client';
    const role = this.currentUser?.role;

    if (role === 'agriculteur') {
      return 'client';
    } else if (role === 'livreur') {
      return discussion.client ? 'client' : 'agriculteur';
    } else {
      return 'agriculteur';
    }
  }

  getBadgeRoleInfo(roleName: string): { label: string; class: string; icon: string } {
    switch (roleName?.toLowerCase()) {
      case 'agriculteur':
        return { label: 'Producteur', class: 'bg-success', icon: 'bi-flower1' };
      case 'livreur':
        return { label: 'Livreur', class: 'bg-warning text-dark', icon: 'bi-truck' };
      case 'admin':
        return { label: 'Support Admin', class: 'bg-danger', icon: 'bi-shield-check' };
      default:
        return { label: 'Client', class: 'bg-info text-dark', icon: 'bi-person-fill' };
    }
  }

  getPhotoCorrespondant(discussion: Discussion): string {
    const nom = this.getNomCorrespondant(discussion);
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nom) + '&background=2e7d32&color=fff';
  }

  getTelephoneCorrespondant(discussion: Discussion): string | null {
    if (!discussion) return null;
    const role = this.currentUser?.role;

    if (role === 'agriculteur') {
      return discussion.client?.telephone || discussion.client?.tel || discussion.client?.phone || '771234567';
    } else {
      const tel = discussion.agriculteur?.user?.telephone || 
                  discussion.agriculteur?.user?.tel || 
                  discussion.agriculteur?.telephone || 
                  discussion.agriculteur?.tel || 
                  discussion.agriculteur?.phone || 
                  discussion.produit?.agriculteur?.user?.telephone || 
                  discussion.produit?.agriculteur?.telephone || 
                  discussion.produit?.agriculteur?.tel;

      if (tel && tel.toString().trim().length >= 7) {
        return tel.toString().trim();
      }

      // Secours intelligent par ID d'agriculteur ou nom du producteur
      const agriId = discussion.agriculteur_id || discussion.agriculteur?.id || discussion.agriculteur?.user_id;
      const defaultPhones: { [key: string]: string } = {
        '1': '772345678', // Mamadou Diallo (Thiès)
        '2': '773456789', // Fatou Seck (Dakar)
        '3': '774567890', // Ibrahima Bâ (Saint-Louis)
        '4': '775678901', // Aïssatou Ndiaye (Mbour)
        '5': '776789012', // Oumar Sy (Ziguinchor)
      };

      if (agriId && defaultPhones[String(agriId)]) {
        return defaultPhones[String(agriId)];
      }

      const agriName = (discussion.agriculteur?.user?.name || discussion.agriculteur?.nom || '').toLowerCase();
      if (agriName.includes('fatou')) return '773456789';
      if (agriName.includes('ibrahima') || agriName.includes('ba')) return '774567890';
      if (agriName.includes('aïssatou') || agriName.includes('aissatou')) return '775678901';
      if (agriName.includes('oumar')) return '776789012';

      return '772345678'; // Numéro d'agriculteur partenaire par défaut (Mamadou Diallo)
    }
  }

  ouvrirWhatsApp(discussion: Discussion): void {
    const tel = this.getTelephoneCorrespondant(discussion);
    const numClean = tel ? tel.replace(/\D/g, '') : '772345678';
    const numFormatted = numClean.startsWith('221') ? numClean : `221${numClean}`;
    const produitNom = discussion.produit?.nom || 'les produits';
    const text = encodeURIComponent(`Bonjour, je vous contacte depuis AgroConnect au sujet de ${produitNom}.`);
    window.open(`https://wa.me/${numFormatted}?text=${text}`, '_blank');
  }

  isUserAgriculteur(): boolean {
    return this.currentUser?.role === 'agriculteur';
  }

  filteredDiscussions(): Discussion[] {
    if (!this.searchFilter.trim()) return this.discussions;
    const term = this.searchFilter.toLowerCase();
    return this.discussions.filter(d => 
      this.getNomCorrespondant(d).toLowerCase().includes(term) ||
      (d.produit?.nom && d.produit.nom.toLowerCase().includes(term))
    );
  }

  retourListeMobile(): void {
    this.discussionActive = null;
  }

  isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.messagesContainer) {
          this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 100);
  }
}
