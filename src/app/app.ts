import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  template: `
    <app-navbar *ngIf="afficherNavbar"></app-navbar>
    <router-outlet></router-outlet>
    <app-footer *ngIf="afficherNavbar"></app-footer>
  `
})
export class AppComponent implements OnInit {
  afficherNavbar = true;

  // Pages sans navbar
  pagesPrivees = [
    '/login',
    '/register',
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.afficherNavbar = !this.pagesPrivees.some(p => e.url.startsWith(p));
    });
  }
}