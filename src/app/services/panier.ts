import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CartItem {
  produit: any;
  quantite: number;
}

@Injectable({ providedIn: 'root' })
export class PanierService {
  private apiUrl = environment.apiUrl;
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialCart();
    this.chargerPanier();
  }

  private loadInitialCart() {
    const saved = localStorage.getItem('agroconnect_cart');
    if (saved) {
      try {
        this.itemsSubject.next(JSON.parse(saved));
      } catch (e) {
        this.itemsSubject.next([]);
      }
    }
  }

  chargerPanier() {
    if (localStorage.getItem('token')) {
      this.http.get<any[]>(`${this.apiUrl}/panier`).subscribe({
        next: (items) => {
          if (Array.isArray(items)) {
            const cartItems: CartItem[] = items.map(item => ({
              produit: item.produit,
              quantite: item.quantite
            }));
            this.saveCart(cartItems);
          }
        },
        error: () => {}
      });
    }
  }

  private saveCart(items: CartItem[]) {
    this.itemsSubject.next(items);
    localStorage.setItem('agroconnect_cart', JSON.stringify(items));
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getPanier(): Observable<any> {
    return this.http.get(`${this.apiUrl}/panier`).pipe(
      catchError(() => of({ items: this.getItems() }))
    );
  }

  ajouter(produit: any, quantite: number = 1): Observable<any> {
    const current = [...this.getItems()];
    const index = current.findIndex(item => item.produit.id === produit.id);
    if (index > -1) {
      current[index].quantite += quantite;
    } else {
      current.push({ produit, quantite });
    }
    this.saveCart(current);

    if (localStorage.getItem('token')) {
      return this.http.post(`${this.apiUrl}/panier/ajouter`, { produit_id: produit.id, quantite }).pipe(
        catchError(() => of({ success: true }))
      );
    }
    return of({ success: true });
  }

  modifierQuantite(produitId: number, delta: number) {
    let current = [...this.getItems()];
    const index = current.findIndex(item => item.produit.id === produitId);
    if (index > -1) {
      current[index].quantite += delta;
      if (current[index].quantite <= 0) {
        current.splice(index, 1);
      }
      this.saveCart(current);

      if (localStorage.getItem('token')) {
        if (delta > 0) {
          this.http.post(`${this.apiUrl}/panier/ajouter`, { produit_id: produitId, quantite: delta })
            .pipe(catchError(() => of({ success: true })))
            .subscribe();
        } else {
          this.http.post(`${this.apiUrl}/panier/diminuer`, { produit_id: produitId, quantite: -delta })
            .pipe(catchError(() => of({ success: true })))
            .subscribe();
        }
      }
    }
  }

  supprimer(produitId: number): Observable<any> {
    const current = this.getItems().filter(item => item.produit.id !== produitId);
    this.saveCart(current);

    if (localStorage.getItem('token')) {
      return this.http.delete(`${this.apiUrl}/panier/${produitId}`).pipe(
        catchError(() => of({ success: true }))
      );
    }
    return of({ success: true });
  }

  viderPanier() {
    this.saveCart([]);
  }

  getTotalCount(): number {
    return this.getItems().reduce((acc, item) => acc + item.quantite, 0);
  }

  getTotalPrice(): number {
    return this.getItems().reduce((acc, item) => acc + (item.produit.prix * item.quantite), 0);
  }
}