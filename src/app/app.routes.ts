import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth-guard';

/**
 * Configuration principale des Routes de l'application AgroConnect.
 * Utilise le Lazy Loading (chargement à la demande) pour optimiser les performances.
 */
export const routes: Routes = [
  // Page d'accueil publique du site
  {
    path: '',
    loadComponent: () =>
      import('./pages/accueil/accueil').then(m => m.AccueilComponent)
  },
  // Catalogue complet des produits agricoles sénégalais
  {
    path: 'catalogue',
    loadComponent: () =>
      import('./pages/catalogue/catalogue').then(m => m.CatalogueComponent)
  },
  // Page de connexion utilisateur
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent)
  },
  // Page d'inscription nouveau compte (Client, Agriculteur, Livreur)
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.RegisterComponent)
  },
  // Gestion du Panier d'achats et tunnel de commande
  {
    path: 'panier',
    loadComponent: () =>
      import('./pages/panier/panier').then(m => m.PanierComponent)
  },
  // Historique des commandes de l'utilisateur connecté (protégé par authGuard)
  {
    path: 'commandes',
    loadComponent: () =>
      import('./pages/commandes/commandes').then(m => m.CommandesComponent),
    canActivate: [authGuard]
  },
  // Espace privé Agriculteur (Réservé au rôle 'agriculteur')
  {
    path: 'agriculteur/dashboard',
    loadComponent: () =>
      import('./pages/agriculteur/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [roleGuard(['agriculteur'])]
  },
  // Espace privé Administrateur (Réservé au rôle 'admin')
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [roleGuard(['admin'])]
  },
  // Espace privé Livreur (Réservé au rôle 'livreur')
  {
    path: 'livreur/dashboard',
    loadComponent: () =>
      import('./pages/livreur/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [roleGuard(['livreur'])]
  },
  // Messagerie / Chat direct (Client <-> Agriculteur)
  {
    path: 'chat',
    loadComponent: () =>
      import('./pages/chat/chat').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chat/:id',
    loadComponent: () =>
      import('./pages/chat/chat').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  // Redirection par défaut si la route n'existe pas
  { path: '**', redirectTo: '' }
];