import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../services/produit';
import { PanierService } from '../../services/panier';
import { CardProduit } from '../../components/card-produit/card-produit';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule, CardProduit, TranslatePipe],
  templateUrl: './catalogue.html',
})

export class CatalogueComponent implements OnInit {

  recherche = '';
  categorieSelectee = '';
  prixMax = 5000;
  bioUniquement = false;

  categories = [
    { id: 1, nom: 'Légumes' },
    { id: 2, nom: 'Fruits' },
    { id: 3, nom: 'Céréales & Graines' },
    { id: 4, nom: 'Tubercules' },
    { id: 5, nom: 'Épices & Herbes' },
    { id: 6, nom: 'Produits Transformés' }
  ];

  regions = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Mbour', 'Kaolack', 'Louga'];
  regionSelectee = '';

  toutLesProduits = [
    { id:1,  nom:'Carottes fraîches',  prix:500,  unite:'kg',    categorie:'Légumes',   region:'Thiès',       agriculteur:'Mamadou Diallo',   stock:45, image:'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=200&fit=crop' },
    { id:2,  nom:'Oignons violets',    prix:350,  unite:'kg',    categorie:'Légumes',   region:'Dakar',       agriculteur:'Fatou Seck',       stock:12, image:'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=200&fit=crop' },
    { id:3,  nom:'Tomates cerises',    prix:800,  unite:'kg',    categorie:'Fruits',    region:'Saint-Louis', agriculteur:'Ibrahima Bâ',      stock:20, image:'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=200&fit=crop' },
    { id:4,  nom:'Laitue verte',       prix:250,  unite:'pièce', categorie:'Légumes',   region:'Mbour',       agriculteur:'Aïssatou Ndiaye',  stock:30, image:'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=200&fit=crop' },
    { id:5,  nom:'Mangues Kent',       prix:1200, unite:'kg',    categorie:'Fruits',    region:'Ziguinchor',  agriculteur:'Oumar Sy',         stock:60, image:'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=200&fit=crop' },
    { id:6,  nom:'Maïs local',         prix:300,  unite:'kg',    categorie:'Céréales',  region:'Kaolack',     agriculteur:'Mamadou Diallo',   stock:100,image:'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=200&fit=crop' },
    { id:7,  nom:'Poivrons verts',     prix:600,  unite:'kg',    categorie:'Légumes',   region:'Thiès',       agriculteur:'Mamadou Diallo',   stock:25, image:'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=200&fit=crop' },
    { id:8,  nom:'Patates douces',     prix:400,  unite:'kg',    categorie:'Tubercules',region:'Louga',       agriculteur:'Fatou Seck',       stock:80, image:'assets/patates_douces.jpg' },
    { id:9,  nom:'Aubergines',         prix:450,  unite:'kg',    categorie:'Légumes',   region:'Dakar',       agriculteur:'Fatou Seck',       stock:35, image:'assets/aubergines.jpg' },
    { id:10, nom:'Pastèques',          prix:800,  unite:'pièce', categorie:'Fruits',    region:'Kaolack',     agriculteur:'Mamadou Diallo',   stock:15, image:'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400&h=200&fit=crop' },
    { id:11, nom:'Gombo frais',        prix:300,  unite:'kg',    categorie:'Légumes',   region:'Saint-Louis', agriculteur:'Ibrahima Bâ',      stock:40, image:'assets/gombo.jpg' },
    { id:12, nom:'Mil local',          prix:250,  unite:'kg',    categorie:'Céréales',  region:'Louga',       agriculteur:'Fatou Seck',       stock:200,image:'assets/mil.jpg' },
    { id:13, nom:'Poireaux frais',     prix:400,  unite:'botte', categorie:'Légumes',   region:'Thiès',       agriculteur:'Mamadou Diallo',   stock:25, image:'assets/poireaux.jpg' },
    { id:14, nom:'Bananes plantains',  prix:600,  unite:'régime',categorie:'Fruits',    region:'Ziguinchor',  agriculteur:'Oumar Sy',         stock:18, image:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=200&fit=crop' },
    { id:15, nom:'Arachides grillées', prix:700,  unite:'kg',    categorie:'Céréales',  region:'Kaolack',     agriculteur:'Mamadou Diallo',   stock:150,image:'assets/arachides.jpg' },
    { id:16, nom:'Piment rouge',       prix:500,  unite:'kg',    categorie:'Légumes',   region:'Dakar',       agriculteur:'Fatou Seck',       stock:30, image:'assets/piment.jpg' },
    { id:17, nom:'Ignames',            prix:550,  unite:'kg',    categorie:'Tubercules',region:'Ziguinchor',  agriculteur:'Oumar Sy',         stock:60, image:'assets/ignames.jpg' },
    { id:18, nom:'Concombres',         prix:300,  unite:'kg',    categorie:'Légumes',   region:'Mbour',       agriculteur:'Aïssatou Ndiaye',  stock:40, image:'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=200&fit=crop' },
    { id:19, nom:'Lait frais local',   prix:800,  unite:'litre', categorie:'Produits laitiers', region:'Saint-Louis', agriculteur:'Ibrahima Bâ', stock:20, image:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=200&fit=crop' },
    { id:20, nom:'Yaourt naturel',     prix:500,  unite:'pot',   categorie:'Produits laitiers', region:'Dakar',       agriculteur:'Fatou Seck',       stock:15, image:'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&h=200&fit=crop' },
    { id:21, nom:'Chou',               prix:300,  unite:'kg',    categorie:'Légumes',   region:'Ziguinchor',  agriculteur:'Oumar Sy',         stock:70, image:'assets/chou.jpg' },
    { id:22, nom:'Épinards frais',     prix:350,  unite:'botte', categorie:'Légumes',   region:'Dakar',       agriculteur:'Fatou Seck',       stock:30, image:'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=200&fit=crop' },
    { id:23, nom:'Papayes',            prix:700,  unite:'pièce', categorie:'Fruits',    region:'Mbour',       agriculteur:'Aïssatou Ndiaye',  stock:25, image:'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&h=200&fit=crop' },
    { id:24, nom:'Sorgho local',       prix:280,  unite:'kg',    categorie:'Céréales',  region:'Louga',       agriculteur:'Fatou Seck',       stock:200,image:'assets/sorgho.jpg' },
    { id:25, nom:'Courgettes',         prix:450,  unite:'kg',    categorie:'Légumes',   region:'Thiès',       agriculteur:'Mamadou Diallo',   stock:35, image:'https://images.unsplash.com/photo-1563252722-6434563a985d?w=400&h=200&fit=crop' },
    { id:26, nom:'Ananas Victoria',    prix:900,  unite:'pièce', categorie:'Fruits',    region:'Ziguinchor',  agriculteur:'Oumar Sy',         stock:20, image:'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=200&fit=crop' },
    { id:27, nom:'Fromage peul',       prix:2000, unite:'kg',    categorie:'Produits laitiers', region:'Saint-Louis', agriculteur:'Ibrahima Bâ',     stock:10, image:'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=200&fit=crop' },
    { id:28, nom:'Pommes de terre',    prix:400,  unite:'kg',    categorie:'Tubercules',region:'Thiès',       agriculteur:'Mamadou Diallo',   stock:90, image:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=200&fit=crop' },
    { id:29, nom:'Chou blanc',         prix:350,  unite:'pièce', categorie:'Légumes',   region:'Dakar',       agriculteur:'Fatou Seck',       stock:45, image:'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&h=200&fit=crop' },
    { id:30, nom:'Citrons jaunes',     prix:600,  unite:'kg',    categorie:'Fruits',    region:'Kaolack',     agriculteur:'Mamadou Diallo',   stock:55, image:'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=200&fit=crop' },
  ];

  produitsFiltres: any[] = [];
  trierPar = 'popularite';

  constructor(
    private produitService: ProduitService,
    private panierService: PanierService,
    private route: ActivatedRoute
  ) {}

  getImageForProduit(nom: string, photo: string): string {
    const nomLower = (nom || '').toLowerCase();
    if (nomLower.includes('bissap') || nomLower.includes('hibiscus')) {
      if (!photo || photo.includes('unsplash') || photo.includes('tea') || !photo.includes('bissap')) {
        return '/assets/illustrations/bissap.png';
      }
    }
    if (nomLower.includes('arachide')) {
      if (!photo || photo.includes('unsplash') || photo.includes('boat') || !photo.includes('arachide')) {
        return '/assets/illustrations/arachides.svg';
      }
    }
    return photo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
  }

  ngOnInit() {
    this.produitsFiltres = [...this.toutLesProduits];

    this.route.queryParams.subscribe(params => {
      if (params['cat']) {
        this.categorieSelectee = params['cat'];
      } else {
        this.categorieSelectee = '';
      }
      this.appliquerFiltres();
    });

    this.produitService.getProduits().subscribe({
      next: (res) => {
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          this.toutLesProduits = data.map((p: any) => ({
            id:          p.id,
            nom:         p.nom,
            prix:        p.prix,
            unite:       p.unite || 'kg',
            categorie:   p.categorie?.nom || 'Légumes',
            region:      p.agriculteur?.localisation || 'Sénégal',
            agriculteur: p.agriculteur?.user?.name || p.agriculteur?.user?.nom || p.agriculteur?.nom || (typeof p.agriculteur === 'string' ? p.agriculteur : 'Producteur local'),
            stock:       p.stock || 10,
            image:       this.getImageForProduit(p.nom, p.photo)
          }));
          this.appliquerFiltres();
        }
      },
      error: () => {}
    });
  }

  appliquerFiltres() {
    this.produitsFiltres = this.toutLesProduits.filter(p => {
      const matchRecherche = !this.recherche.trim() ||
        p.nom.toLowerCase().includes(this.recherche.toLowerCase()) ||
        (p.agriculteur && p.agriculteur.toLowerCase().includes(this.recherche.toLowerCase())) ||
        (p.region && p.region.toLowerCase().includes(this.recherche.toLowerCase()));

      const matchCategorie = !this.categorieSelectee || p.categorie === this.categorieSelectee;
      const matchRegion = !this.regionSelectee || p.region === this.regionSelectee;

      return matchRecherche && matchCategorie && matchRegion;
    });

    this.trierProduits();
  }

  trierProduits() {
    if (this.trierPar === 'prix_asc') {
      this.produitsFiltres.sort((a, b) => a.prix - b.prix);
    } else if (this.trierPar === 'prix_desc') {
      this.produitsFiltres.sort((a, b) => b.prix - a.prix);
    }
  }

  reinitialiserFiltres() {
    this.recherche = '';
    this.categorieSelectee = '';
    this.regionSelectee = '';
    this.trierPar = 'popularite';
    this.produitsFiltres = [...this.toutLesProduits];
  }
}