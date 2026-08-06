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

  private consolidateItems(items: CartItem[]): CartItem[] {
    const map = new Map<number, CartItem>();
    items.forEach(item => {
      if (!item || !item.produit) return;
      const pid = Number(item.produit.id);
      if (map.has(pid)) {
        map.get(pid)!.quantite += item.quantite;
      } else {
        map.set(pid, {
          produit: item.produit,
          quantite: item.quantite
        });
      }
    });
    return Array.from(map.values());
  }

  private loadInitialCart() {
    const saved = localStorage.getItem('agroconnect_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.itemsSubject.next(this.consolidateItems(parsed));
        }
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
    const consolidated = this.consolidateItems(items);
    this.itemsSubject.next(consolidated);
    localStorage.setItem('agroconnect_cart', JSON.stringify(consolidated));
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
    const targetId = Number(produit.id);
    const index = current.findIndex(item => Number(item.produit?.id) === targetId);

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
    const targetId = Number(produitId);
    const index = current.findIndex(item => Number(item.produit?.id) === targetId);

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
    const targetId = Number(produitId);
    const current = this.getItems().filter(item => Number(item.produit?.id) !== targetId);
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