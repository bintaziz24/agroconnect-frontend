import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Gardien de Connexion (authGuard) :
 * Vérifie si l'utilisateur est bien connecté avant de lui autoriser l'accès à la page demandée.
 * Si l'utilisateur n'est pas connecté, il est redirigé automatiquement vers la page /login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Accès autorisé
  }

  // Redirection vers la page de connexion
  router.navigate(['/login']);
  return false; // Accès bloqué
};

/**
 * Gardien de Rôles (roleGuard) :
 * Empêche les utilisateurs d'accéder à des espaces réservés (ex: Client voulant accéder au Dashboard Agriculteur).
 * @param allowedRoles Liste des rôles autorisés (ex: ['agriculteur'], ['admin'], ['livreur'])
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Vérification que l'utilisateur est connecté
    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    // 2. Vérification de statut de validation pour Agriculteur / Livreur
    const user = authService.getUser();
    if (user && ['rejeté', 'refusé', 'suspendu'].includes(user?.statut_validation)) {
      alert(`Accès refusé : Votre compte a été rejeté ou suspendu par l'administration AgroConnect.`);
      router.navigate(['/']);
      return false;
    }

    if (user && (allowedRoles.includes(user.role) || user.role === 'admin')) {
      return true; // Accès autorisé si l'utilisateur possède un rôle autorisé (ou est admin)
    }

    // 3. Blocage et alerte si tentative d'usurpation ou de navigation non autorisée
    alert(`Accès refusé : Votre compte (${user?.name || 'Utilisateur'}) n'a pas le rôle requis pour accéder à cet espace.`);
    
    // Redirection automatique vers l'espace autorisé approprié
    if (user?.role === 'client') {
      router.navigate(['/catalogue']);
    } else if (user?.role === 'agriculteur') {
      router.navigate(['/agriculteur/dashboard']);
    } else if (user?.role === 'livreur') {
      router.navigate(['/livreur/dashboard']);
    } else {
      router.navigate(['/']);
    }
    return false; // Accès bloqué
  };
};