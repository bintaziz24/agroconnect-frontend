import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

/**
 * Composant Racine de l'application AgroConnect (AppComponent)
 * Gère la structure globale de l'interface :
 * 1. Affichage/Masquage de la Navbar et du Footer selon la page active.
 * 2. Détection automatique des éléments animés au défilement (Scroll Animations).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  template: `
    <!-- Barre de navigation (Navbar) visible sur les pages publiques -->
    <app-navbar *ngIf="afficherNavbar"></app-navbar>

    <!-- Point d'injection des pages dynamique (RouterOutlet) -->
    <router-outlet></router-outlet>

    <!-- Pied de page (Footer) visible sur les pages publiques -->
    <app-footer *ngIf="afficherNavbar"></app-footer>
  `
})
export class AppComponent implements OnInit, AfterViewInit {
  // Indique si la barre de navigation et le footer doivent être affichés
  afficherNavbar = true;

  // Observateur d'intersection pour déclencher les animations au défilement
  private observer: IntersectionObserver | null = null;
  private observedElements = new Set<Element>();

  // Liste des pages privées où la barre de navigation globale est masquée
  pagesPrivees = [
    '/login',
    '/register',
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Écoute les changements de navigation (URL) dans l'application
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      // Masque la Navbar si l'URL commence par l'une des pages privées (ex: /login)
      this.afficherNavbar = !this.pagesPrivees.some(p => e.url.startsWith(p));
      
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
          // Dès qu'un élément devient visible à l'écran, on lui ajoute la classe 'visible'
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer?.unobserve(entry.target);
            this.observedElements.delete(entry.target);
          }
        });
      }, {
        threshold: 0.05 // Déclenche l'animation dès que 5% de l'élément est visible
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