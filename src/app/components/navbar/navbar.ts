import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PanierService } from '../../services/panier';
import { TranslationService } from '../../services/translation';

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

  constructor(
    private authService: AuthService,
    private panierService: PanierService,
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
    this.authService.user$.subscribe((user: any) => {
      this.user = user;
      this.isLoggedIn = !!user;
    });

    this.panierService.items$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.quantite, 0);
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  selectRole(role: string) {
    if (role === 'public') {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/']);
      });
    } else if (role === 'client') {
      this.authService.login({ email: 'cheikh@test.com', password: 'password' }).subscribe({
        next: () => {
          this.router.navigate(['/catalogue']);
        }
      });
    } else if (role === 'agriculteur') {
      this.authService.login({ email: 'mamadou@test.com', password: 'password' }).subscribe({
        next: () => {
          this.router.navigate(['/agriculteur/dashboard']);
        }
      });
    } else if (role === 'admin') {
      this.authService.login({ email: 'admin@agroconnect.sn', password: 'password' }).subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
        }
      });
    } else if (role === 'livreur') {
      this.authService.login({ email: 'cheikh@test.com', password: 'password' }).subscribe({
        next: (res) => {
          const userCopy = { ...res.user, role: 'livreur', name: 'Ibrahima Faye' };
          localStorage.setItem('user', JSON.stringify(userCopy));
          const authObj = this.authService as any;
          if (authObj.userSubject) {
            authObj.userSubject.next(userCopy);
          }
          this.router.navigate(['/livreur/dashboard']);
        }
      });
    }
  }

  envoyerMessage(event: Event) {
    event.preventDefault();
    if (!this.nouveauMessage.trim()) return;

    this.chatMessages.push({
      texte: this.nouveauMessage,
      estMe: true,
      auteur: this.user ? this.user.name : 'Moi',
      heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    const msg = this.nouveauMessage;
    this.nouveauMessage = '';

    setTimeout(() => {
      this.chatMessages.push({
        texte: `Merci pour votre message ! Notre assistance a bien reçu : "${msg}". Un conseiller va vous répondre dans quelques instants.`,
        estMe: false,
        auteur: 'Assistance AgroConnect',
        heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 1000);
  }
}