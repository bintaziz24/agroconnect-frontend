import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { WhatsappService } from './services/whatsapp';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  template: `
    <!-- Barre de navigation (Navbar) visible sur les pages publiques -->
    <app-navbar *ngIf="afficherNavbar"></app-navbar>

    <!-- Point d'injection des pages dynamique (RouterOutlet) -->
    <router-outlet></router-outlet>

    <!-- Bouton Flottant WhatsApp (Masqué sur login/register/chat) -->
    <a *ngIf="afficherNavbar && !estPageChat"
       (click)="ouvrirWhatsapp()" 
       class="position-fixed bottom-0 end-0 m-4 p-3 rounded-circle shadow-lg text-white d-flex align-items-center justify-content-center border-0 text-decoration-none whatsapp-floating-btn"
       style="width: 58px; height: 58px; background: #25D366; z-index: 9999; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4) !important;"
       title="Besoin d'aide ? Discutez avec AgroConnect sur WhatsApp 💬">
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.068-.315-.099-.448.099-.133.197-.513.646-.629.776-.117.13-.232.148-.43.05-.197-.099-.834-.308-1.587-.978-.588-.523-.984-1.168-1.101-1.367-.116-.197-.013-.304.086-.403.088-.088.197-.232.296-.347.099-.116.133-.197.198-.329.066-.133.033-.248-.017-.347-.05-.099-.448-1.082-.614-1.482-.162-.389-.328-.337-.448-.343-.115-.006-.247-.007-.38-.007s-.347.05-.528.248c-.18.198-.692.677-.692 1.652 0 .974.71 1.916.808 2.048.099.132 1.398 2.133 3.387 2.99.472.204.84.326 1.127.417.473.151.904.13 1.245.079.38-.058 1.17-.478 1.336-.94.165-.463.165-.859.116-.94-.049-.082-.182-.132-.379-.23z"/>
      </svg>
    </a>

    <!-- Pied de page (Footer) visible sur les pages publiques -->
    <app-footer *ngIf="afficherNavbar && !estPageChat"></app-footer>
  `
})
export class AppComponent implements OnInit, AfterViewInit {
  // Indique si la barre de navigation et le footer doivent être affichés
  afficherNavbar = true;
  estPageChat = false;

  // Observateur d'intersection pour déclencher les animations au défilement
  private observer: IntersectionObserver | null = null;
  private observedElements = new Set<Element>();

  // Liste des pages privées où la barre de navigation globale est masquée
  pagesPrivees = [
    '/login',
    '/register',
  ];

  constructor(
    private router: Router,
    private whatsappService: WhatsappService
  ) {}

  ouvrirWhatsapp() {
    this.whatsappService.ouvrirChatDirect();
  }

  ngOnInit() {
    // Écoute les changements de navigation (URL) dans l'application
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      // Masque la Navbar si l'URL commence par l'une des pages privées (ex: /login)
      this.afficherNavbar = !this.pagesPrivees.some(p => e.url.startsWith(p));
      this.estPageChat = e.url.startsWith('/chat');
      
      // Relance le scanner d'animations après chaque changement de page
      setTimeout(() => this.scannerElementsAnimations(), 150);
    });
  }

  ngAfterViewInit() {
    // Initialise l'observateur d'animation dès le chargement du DOM
    this.initialiserObserverGlobal();
    setTimeout(() => this.scannerElementsAnimations(), 150);
  }

  /**
   * Configure l'IntersectionObserver pour animer les cartes et textes lors du défilement (scroll)
   */
  private initialiserObserverGlobal() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // Ré-anime à chaque fois que l'élément entre/sort de l'écran au défilement
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      }, {
        threshold: 0.1, // Déclenche l'animation dès que 10% de l'élément est visible au scroll
        rootMargin: '0px 0px -40px 0px'
      });

      // Détecte les nouveaux éléments ajoutés dynamiquement dans le DOM (MutationObserver)
      if ('MutationObserver' in window) {
        const mutationObserver = new MutationObserver(() => {
          this.scannerElementsAnimations();
        });
        mutationObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }
  }

  /**
   * Scanne le DOM pour trouver tous les éléments marqués pour animation
   */
  private scannerElementsAnimations() {
    if (!this.observer) return;
    const selectors = ['.animate-on-scroll', '.animate-slide-left', '.animate-slide-right'];
    selectors.forEach(sel => {
      const elements = document.querySelectorAll(sel);
      elements.forEach(el => {
        if (!el.classList.contains('visible') && !this.observedElements.has(el)) {
          this.observer?.observe(el);
          this.observedElements.add(el);
        }
      });
    });
  }
}