import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PanierService } from '../../services/panier';
import { NotificationService } from '../../services/notification';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
})
export class RegisterComponent {
  formData = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'client',
    password: '',
    password_confirmation: '',
  };
  afficherMotDePasse = false;
  afficherConfirmation = false;
  erreur = '';
  succes = '';
  chargement = false;


  constructor(
    private authService: AuthService,
    private panierService: PanierService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit() {
    this.erreur = '';
    this.succes = '';
    this.formData.email = (this.formData.email || '').trim().toLowerCase();

    if (this.formData.password !== this.formData.password_confirmation) {
      this.erreur = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.chargement = true;

    this.authService.register(this.formData).subscribe({
      next: (res: any) => {
        this.chargement = false;

        // Déconnecter immédiatement toute session temporaire créée lors de l'inscription
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirection vers la page de connexion avec message de confirmation
        this.router.navigate(['/login'], {
          queryParams: {
            registered: 'true',
            email: this.formData.email,
            role: this.formData.role
          }
        });
      },

      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message ||
          (err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : null) ||
          'Une erreur est survenue lors de l\'inscription.';
      }
    });
  }
}