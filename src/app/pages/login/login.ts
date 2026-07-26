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

  onSubmit() {
    this.erreur = '';
    this.chargement = true;

    this.authService.login(this.formData).subscribe({
      next: (res) => {
        this.chargement = false;
        this.panierService.chargerPanier();
        
        const redirect = this.route.snapshot.queryParams['redirect'];
        if (redirect === 'panier') {
          this.router.navigate(['/panier']);
          return;
        }

        const role = res.user.role;
        if (role === 'agriculteur') {
          this.router.navigate(['/agriculteur/dashboard']);
        } else if (role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Email ou mot de passe incorrect.';
      }
    });
  }
}