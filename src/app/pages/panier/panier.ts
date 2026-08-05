import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './panier.html',
  styleUrl: './panier.scss',
})
export class PanierComponent implements OnInit {
  items: CartItem[] = [];
  fraisLivraison = 1000;
  etape: 'panier' | 'livraison' | 'confirmation' = 'panier';

  formLivraison = {
    nom: '',
    telephone: '',
    region: 'Thiès',
    adresse: '',
    modePaiement: 'wave',
    notes: '',
  };

  chargement = false;
  erreur = '';
  commandeSuccess: any = null;

  regions = ['Thiès', 'Dakar', 'Saint-Louis', 'Ziguinchor', 'Mbour', 'Kaolack', 'Louga', 'Diourbel', 'Fatick', 'Kolda', 'Matam', 'Tambacounda'];

  constructor(
    public panierService: PanierService,
    private commandeService: CommandeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.panierService.items$.subscribe(items => {
      this.items = items;
    });

    const user = this.authService.getUser();
    if (user) {
      this.formLivraison.nom = user.name || '';
      this.formLivraison.telephone = user.telephone || '';
    }
  }

  choisirModePaiement(mode: string) {
    this.formLivraison.modePaiement = mode;
  }

  modifierQuantite(produitId: number, delta: number) {
    this.panierService.modifierQuantite(produitId, delta);
  }

  supprimer(produitId: number) {
    this.panierService.supprimer(produitId);
  }

  get sousTotal(): number {
    return this.panierService.getTotalPrice();
  }

  get total(): number {
    if (this.items.length === 0) return 0;
    return this.sousTotal + this.fraisLivraison;
  }

  passerALivraison() {
    if (this.items.length === 0) return;

    if (!this.authService.getUser()) {
      this.router.navigate(['/login'], { queryParams: { redirect: 'panier' } });
      return;
    }

    this.etape = 'livraison';
  }

  validerCommande() {
    if (!this.formLivraison.nom || !this.formLivraison.telephone || !this.formLivraison.adresse) {
      this.erreur = 'Veuillez remplir tous les champs obligatoires (Nom, Téléphone, Adresse).';
      return;
    }

    this.erreur = '';
    this.chargement = true;

    try {
      if (!this.items || this.items.length === 0) {
        this.chargement = false;
        this.erreur = 'Votre panier est vide.';
        return;
      }

      const lignes = this.items
        .filter(item => item && (item.produit || (item as any).id))
        .map(item => {
          const p = item.produit || item;
          return {
            produit_id: Number(p.id || (p as any).produit_id),
            quantite: Number(item.quantite || 1),
            prix_unitaire: Number(p.prix || (p as any).prix_unitaire || 0)
          };
        })
        .filter(l => l.produit_id && !isNaN(l.produit_id));

      if (lignes.length === 0) {
        this.chargement = false;
        this.erreur = 'Votre panier ne contient aucun produit valide.';
        return;
      }

      let rawMode = (this.formLivraison.modePaiement || 'wave').toLowerCase().trim();
      let cleanMode = 'wave';
      if (rawMode.includes('orange') || rawMode.includes('om')) {
        cleanMode = 'orange_money';
      } else if (rawMode.includes('cash') || rawMode.includes('livraison')) {
        cleanMode = 'cash';
      }

      const payload = {
        adresse_livraison: `${this.formLivraison.adresse}, ${this.formLivraison.region}`,
        telephone: this.formLivraison.telephone,
        mode_paiement: cleanMode,
        montant_total: this.total,
        lignes: lignes
      };

      this.commandeService.creerCommande(payload).pipe(timeout(12000)).subscribe({
        next: (res: any) => {
          this.chargement = false;
          this.commandeSuccess = res;
          
          // Si PayTech renvoie une URL de redirection (Wave / Orange Money)
          if (res && res.redirect_url) {
            window.location.href = res.redirect_url;
            return;
          }

          // Notification temps réel pour l'espace agriculteur
          try {
            localStorage.setItem('derniere_commande_timestamp', Date.now().toString());
            window.dispatchEvent(new CustomEvent('nouvelle-commande', { detail: res }));
          } catch(e) {}

          this.panierService.viderPanier();
          this.etape = 'confirmation';
        },

        error: (err: any) => {
          this.chargement = false;
          if (err && err.name === 'TimeoutError') {
            this.erreur = 'Le serveur de base de données Render sort de veille. Veuillez re-cliquer sur Valider la commande dans 3 secondes.';
            return;
          }

          let msg = 'Une erreur est survenue lors de la création de la commande.';
          if (err && err.error) {
            if (typeof err.error.message === 'string' && err.error.message.trim()) {
              msg = err.error.message;
            } else if (err.error.errors && typeof err.error.errors === 'object') {
              try {
                msg = Object.values(err.error.errors).flat().join(' ');
              } catch (e) {
                msg = 'Erreur lors du traitement du paiement.';
              }
            }
          }
          this.erreur = msg;
        }
      });
    } catch (e: any) {
      this.chargement = false;
      this.erreur = 'Une erreur est survenue : ' + (e?.message || 'Vérifiez les informations saisies.');
    }
  }


  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop';
  }
}
