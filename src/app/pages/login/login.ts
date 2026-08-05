import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PanierService } from '../../services/panier';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
})
export class LoginComponent {
  formData = {
    email: '',
    password: '',
  };
  erreur = '';
  chargement = false;

  constructor(
    private authService: AuthService,
    private panierService: PanierService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  remplirChampsDemo(role: string) {
    if (role === 'client') {
      this.formData.email = 'cheikh@test.com';
      this.formData.password = 'password';
    } else if (role === 'agriculteur') {
      this.formData.email = 'mamadou@test.com';
      this.formData.password = 'password';
    } else if (role === 'admin') {
      this.formData.email = 'admin@agroconnect.sn';
      this.formData.password = 'password';
    } else if (role === 'livreur') {
      this.formData.email = 'modou@test.com';
      this.formData.password = 'password';
    }
  }

  onSubmit() {
    this.erreur = '';
    this.formData.email = (this.formData.email || '').trim().toLowerCase();

    if (!this.formData.email || !this.formData.password) {
      this.erreur = 'Veuillez remplir l\'adresse e-mail (ou téléphone) et le mot de passe.';
      return;
    }

    this.chargement = true;

    this.authService.login(this.formData).subscribe({
      next: (res) => {
        this.chargement = false;

        if (!res || !res.user) {
          this.erreur = 'Identifiants incorrects.';
          return;
        }

        this.panierService.chargerPanier();
        
        const redirect = this.route.snapshot.queryParams['redirect'];
        if (redirect) {
          this.router.navigate(['/' + redirect.replace(/^\//, '')]);
          return;
        }

        const role = res.user?.role;
        if (role === 'agriculteur') {
          this.router.navigate(['/agriculteur/dashboard']);
        } else if (role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'livreur') {
          this.router.navigate(['/livreur/dashboard']);
        } else if (role === 'client') {
          this.router.navigate(['/catalogue']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.chargement = false;
        let msg = 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail ou téléphone.';
        if (err && err.error) {
          if (typeof err.error.message === 'string' && err.error.message.trim()) {
            msg = err.error.message;
          } else if (err.error.errors && typeof err.error.errors === 'object') {
            try {
              msg = Object.values(err.error.errors).flat().join(' ');
            } catch (e) {
              msg = 'Accès refusé. Veuillez vérifier vos identifiants.';
            }
          }
        } else if (err && typeof err.message === 'string') {
          msg = err.message;
        }
        this.erreur = msg;
      }
    });
  }
}