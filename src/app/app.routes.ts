import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/accueil/accueil').then(m => m.AccueilComponent)
  },
  {
    path: 'catalogue',
    loadComponent: () =>
      import('./pages/catalogue/catalogue').then(m => m.CatalogueComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'panier',
    loadComponent: () =>
      import('./pages/panier/panier').then(m => m.PanierComponent)
  },
  {
    path: 'commandes',
    loadComponent: () =>
      import('./pages/commandes/commandes').then(m => m.CommandesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'agriculteur/dashboard',
    loadComponent: () =>
      import('./pages/agriculteur/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'livreur/dashboard',
    loadComponent: () =>
      import('./pages/livreur/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];