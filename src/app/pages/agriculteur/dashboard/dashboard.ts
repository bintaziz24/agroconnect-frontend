import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProduitService } from '../../../services/produit';
import { CommandeService } from '../../../services/commande';
import { AuthService } from '../../../services/auth';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-agriculteur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  ongletActif: 'apercu' | 'produits' | 'commandes' = 'apercu';
  pollInterval: any = null;
  nouvelleCommandeAlerte = false;
  nombreCommandesPrecedent = 0;

  stats = {
    revenus: 0,
    commandes: 0,
    produits: 0,
    note: 4.8,
    nombreAvis: 0
  };

  produits: any[] = [];
  commandes: any[] = [];

  afficherModalForm = false;
  nouveauProduit = {
    nom: '',
    nomLocal: '',
    region: 'Thiès',
    prix: 1000,
    unite: 'kg',
    stock: 100,
    categorie: 'Légumes',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop',
    description: 'Récolte fraîche du jour au Sénégal, sans produits chimiques nocifs.',
  };

  categories = ['Légumes', 'Fruits', 'Céréales & Graines', 'Tubercules', 'Épices & Herbes', 'Produits Transformés', 'Produits laitiers'];
  regions = ['Thiès', 'Dakar', 'Ziguinchor', 'Saint-Louis', 'Kaolack', 'Louga', 'Diourbel', 'Fatick', 'Kolda', 'Matam', 'Tambacounda'];
  illustrationSelectionnee = 'mangues';

  illustrations = [
    { id: 'mangues', nom: 'Mangues', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop' },
    { id: 'oignons', nom: 'Oignons violets', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop' },
    { id: 'riz', nom: 'Riz de la Vallée', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop' },
    { id: 'tomates', nom: 'Tomates', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop' },
    { id: 'bissap', nom: 'Fleurs de Bissap', url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmdHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZjVmNSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWQ3ZDciLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InBldGFsR3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTUzZTNlIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjYzUzMDMwIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzgwNWFkNSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0icGV0YWxHcmFkMiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5YjJjMmMiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNzQyYTJhIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsZWFmR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzOGExNjkiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMjI1NDNkIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGZpbHRlciBpZD0ic2hhZG93IiB4PSItMTAlIiB5PSItMTAlIiB3aWR0aD0iMTIwJSIgaGVpZ2h0PSIxMjAlIj4KICAgICAgPGZlRHJvcFNoYWRvdyBkeD0iMiIgZHk9IjYiIHN0ZERldmlhdGlvbj0iNiIgZmxvb2QtY29sb3I9IiM3NDJhMmEiIGZsb29kLW9wYWNpdHk9IjAuMjUiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KCiAgPCEtLSBGb25kIC0tPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiByeD0iMzIiIGZpbGw9InVybCgjYmdHcmFkKSIvPgogIAogIDwhLS0gTW90aWYgZMOpY29yYXRpZiBhcnJpw6hyZS1wbGFuIC0tPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjE5MCIgcj0iMTMwIiBmaWxsPSIjZmViMmIyIiBvcGFjaXR5PSIwLjQiLz4KICAKICA8ZyBmaWx0ZXI9InVybCgjc2hhZG93KSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwgLTEwKSI+CiAgICA8IS0tIEZldWlsbGVzIHZlcnRlcyAtLT4KICAgIDxwYXRoIGQ9Ik0gMTIwLDI0MCBDIDkwLDIwMCAxMDAsMTUwIDE0MCwxNDAgQyAxNTAsMTgwIDE0MCwyMjAgMTIwLDI0MCBaIiBmaWxsPSJ1cmwoI2xlYWZHcmFkKSIvPgogICAgPHBhdGggZD0iTSAyODAsMjQwIEMgMzEwLDIwMCAzMDAsMTUwIDI2MCwxNDAgQyAyNTAsMTgwIDI2MCwyMjAgMjgwLDI0MCBaIiBmaWxsPSJ1cmwoI2xlYWZHcmFkKSIvPgogICAgCiAgICA8IS0tIEZsZXVyIGRlIEJpc3NhcCBQcmluY2lwYWxlIChIaWJpc2N1cyBTYWJkYXJpZmZhKSAtLT4KICAgIDwhLS0gUMOpdGFsZXMgZXh0w6lyaWV1cmVzIC8gQ2FsaWNlcyBkZSBCaXNzYXAgLS0+CiAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDAsIDE5MCkiPgogICAgICA8IS0tIFDDqXRhbGUgMSBUb3AgLS0+CiAgICAgIDxwYXRoIGQ9Ik0gMCwwIEMgLTM1LC04NSAzNSwtODUgMCwwIFoiIGZpbGw9InVybCgjcGV0YWxHcmFkMSkiIHRyYW5zZm9ybT0icm90YXRlKDApIi8+CiAgICAgIDwhLS0gUMOpdGFsZSAyIFJpZ2h0IC0tPgogICAgICA8cGF0aCBkPSJNIDAsMCBDIC0zNSwtODUgMzUsLTg1IDAsMCBaIiBmaWxsPSJ1cmwoI3BldGFsR3JhZDEpIiB0cmFuc2Zvcm09InJvdGF0ZSg3MikiLz4KICAgICAgPCEtLSBQw6l0YWxlIDMgQm90dG9tIFJpZ2h0IC0tPgogICAgICA8cGF0aCBkPSJNIDAsMCBDIC0zNSwtODUgMzUsLTg1IDAsMCBaIiBmaWxsPSJ1cmwoI3BldGFsR3JhZDEpIiB0cmFuc2Zvcm09InJvdGF0ZSgxNDQpIi8+CiAgICAgIDwhLS0gUMOpdGFsZSA0IEJvdHRvbSBMZWZ0IC0tPgogICAgICA8cGF0aCBkPSJNIDAsMCBDIC0zNSwtODUgMzUsLTg1IDAsMCBaIiBmaWxsPSJ1cmwoI3BldGFsR3JhZDEpIiB0cmFuc2Zvcm09InJvdGF0ZSgyMTYpIi8+CiAgICAgIDwhLS0gUMOpdGFsZSA1IExlZnQgLS0+CiAgICAgIDxwYXRoIGQ9Ik0gMCwwIEMgLTM1LC04NSAzNSwtODUgMCwwIFoiIGZpbGw9InVybCgjcGV0YWxHcmFkMSkiIHRyYW5zZm9ybT0icm90YXRlKDI4OCkiLz4KCiAgICAgIDwhLS0gQ29ldXIgZm9uY8OpIGR1IENhbGljZSBkZSBCaXNzYXAgLS0+CiAgICAgIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIzMiIgZmlsbD0idXJsKCNwZXRhbEdyYWQyKSIvPgogICAgICAKICAgICAgPCEtLSDDiXRhbWluZXMgY2VudHJhbGVzIGphdW5lcyBkb3LDqWVzIC0tPgogICAgICA8cGF0aCBkPSJNIDAsMCBRIDE1LC0yMCAyNSwtNDAiIHN0cm9rZT0iI2VjYzk0YiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgICAgPGNpcmNsZSBjeD0iMjUiIGN5PSItNDAiIHI9IjUiIGZpbGw9IiNmNmUwNWUiLz4KICAgICAgPGNpcmNsZSBjeD0iMjAiIGN5PSItMzUiIHI9IjQiIGZpbGw9IiNmYWYwODkiLz4KICAgICAgPGNpcmNsZSBjeD0iMjgiIGN5PSItMzMiIHI9IjMuNSIgZmlsbD0iI2VjYzk0YiIvPgogICAgICA8Y2lyY2xlIGN4PSIxNSIgY3k9Ii00MiIgcj0iMyIgZmlsbD0iI2Y2ZTA1ZSIvPgogICAgPC9nPgoKICAgIDwhLS0gR291c3NlcyAvIENhbGljZXMgc8OpY2jDqWVzIGF1IHNvbCAtLT4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzMCwgMjYwKSBzY2FsZSgwLjYpIj4KICAgICAgPHBhdGggZD0iTSAwLDAgQyAtMjUsLTYwIDI1LC02MCAwLDAgWiIgZmlsbD0idXJsKCNwZXRhbEdyYWQyKSIvPgogICAgPC9nPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjcwLCAyNjApIHNjYWxlKDAuNikgcm90YXRlKDIwKSI+CiAgICAgIDxwYXRoIGQ9Ik0gMCwwIEMgLTI1LC02MCAyNSwtNjAgMCwwIFoiIGZpbGw9InVybCgjcGV0YWxHcmFkMikiLz4KICAgIDwvZz4KICA8L2c+CgogIDwhLS0gRXRpcXVldHRlIFByb2R1aXQgLS0+CiAgPHJlY3QgeD0iNTAiIHk9IjMyNSIgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0OCIgcng9IjI0IiBmaWxsPSIjOWIyYzJjIi8+CiAgPHRleHQgeD0iMjAwIiB5PSIzNTYiIGZvbnQtZmFtaWx5PSInT3V0Zml0JywgJ1NlZ29lIFVJJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZsZXVycyBkZSBCaXNzYXAgKEhpYmlzY3VzKTwvdGV4dD4KPC9zdmc+Cg==' },
    { id: 'arachides', nom: 'Arachides', url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmdHcmFkQXJhY2hpZGUiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmYWYwIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZlZWJjOCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic2hlbGxHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2RkNmIyMCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2MwNTYyMSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3YjM0MWUiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Im51dEdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjZhZDU1Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2RkNmIyMCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iaW5uZXJOdXRHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZWRkNSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZGJhNzQiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8ZmlsdGVyIGlkPSJzaGFkb3dBcmFjaGlkZSIgeD0iLTEwJSIgeT0iLTEwJSIgd2lkdGg9IjEyMCUiIGhlaWdodD0iMTIwJSI+CiAgICAgIDxmZURyb3BTaGFkb3cgZHg9IjIiIGR5PSI2IiBzdGREZXZpYXRpb249IjYiIGZsb29kLWNvbG9yPSIjN2IzNDFlIiBmbG9vZC1vcGFjaXR5PSIwLjI1Ii8+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CgogIDwhLS0gRm9uZCAtLT4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgcng9IjMyIiBmaWxsPSJ1cmwoI2JnR3JhZEFyYWNoaWRlKSIvPgogIAogIDwhLS0gQ0VSQ0xFIETDiUNPUkFUSUYgLS0+CiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTg1IiByPSIxMzAiIGZpbGw9IiNmYmQzOGQiIG9wYWNpdHk9IjAuNCIvPgoKICA8ZyBmaWx0ZXI9InVybCgjc2hhZG93QXJhY2hpZGUpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLCAtNSkiPgogICAgPCEtLSBBcmFjaGlkZSBlbiBnb3Vzc2UgUHJpbmNpcGFsZSAxIC0tPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTkwLCAxNjApIHJvdGF0ZSgtMjUpIj4KICAgICAgPCEtLSBGb3JtZSBjYXJhY3TDqXJpc3RpcXVlIGVuIDggZGUgbGEgZ291c3NlIGQnYXJhY2hpZGUgLS0+CiAgICAgIDxwYXRoIGQ9Ik0gLTYwLDAgQyAtNjAsLTM1IC0yNSwtNDAgMCwtMjAgQyAyNSwtNDAgNjAsLTM1IDYwLDAgQyA2MCwzNSAyNSw0MCAwLDIwIEMgLTI1LDQwIC02MCwzNSAtNjAsMCBaIiBmaWxsPSJ1cmwoI3NoZWxsR3JhZCkiLz4KICAgICAgPCEtLSBMaWduZXMgZGUgdGV4dHVyZSBjcm9pc8OpZXMgc3VyIGxhIGNvcXVlIC0tPgogICAgICA8cGF0aCBkPSJNIC00NSwtMTAgUSAwLC01IDQ1LC0xMCBNIC00MCwxMCBRIDAsNSA0MCwxMCIgc3Ryb2tlPSIjOWM0MjIxIiBzdHJva2Utd2lkdGg9IjIuNSIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC42Ii8+CiAgICAgIDxwYXRoIGQ9Ik0gLTMwLC0yMCBRIC0yMCwwIC0zMCwyMCBNIDAsLTE1IFEgMCwwIDAsMTUgTSAzMCwtMjAgUSAyMCwwIDMwLDIwIiBzdHJva2U9IiM5YzQyMjEiIHN0cm9rZS13aWR0aD0iMi41IiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjYiLz4KICAgIDwvZz4KCiAgICA8IS0tIEFyYWNoaWRlIGVuIGdvdXNzZSAyIC0tPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjMwLCAyMTApIHJvdGF0ZSgzNSkiPgogICAgICA8cGF0aCBkPSJNIC01MCwwIEMgLTUwLC0zMCAtMjAsLTM1IDAsLTE1IEMgMjAsLTM1IDUwLC0zMCA1MCwwIEMgNTAsMzAgMjAsMzUgMCwxNSBDIC0yMCwzNSAtNTAsMzAgLTUwLDAgWiIgZmlsbD0idXJsKCNzaGVsbEdyYWQpIi8+CiAgICAgIDxwYXRoIGQ9Ik0gLTM1LC04IFEgMCwtNCAzNSwtOCBNIC0zMCw4IFEgMCw0IDMwLDgiIHN0cm9rZT0iIzljNDIyMSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjYiLz4KICAgIDwvZz4KCiAgICA8IS0tIEdyYWlucyBkJ2FyYWNoaWRlcyBkw6ljb3J0aXF1w6lzIGF1IHByZW1pZXIgcGxhbiAtLT4KICAgIDwhLS0gR3JhaW4gMSAtLT4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzMCwgMjMwKSByb3RhdGUoMTUpIj4KICAgICAgPGVsbGlwc2UgY3g9IjAiIGN5PSIwIiByeD0iMjIiIHJ5PSIzMiIgZmlsbD0idXJsKCNudXRHcmFkKSIvPgogICAgICA8ZWxsaXBzZSBjeD0iLTQiIGN5PSItNSIgcng9IjE0IiByeT0iMjIiIGZpbGw9InVybCgjaW5uZXJOdXRHcmFkKSIgb3BhY2l0eT0iMC41Ii8+CiAgICA8L2c+CiAgICA8IS0tIEdyYWluIDIgLS0+CiAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNzUsIDI1NSkgcm90YXRlKC00MCkiPgogICAgICA8ZWxsaXBzZSBjeD0iMCIgY3k9IjAiIHJ4PSIyMCIgcnk9IjMwIiBmaWxsPSJ1cmwoI251dEdyYWQpIi8+CiAgICAgIDxlbGxpcHNlIGN4PSItMyIgY3k9Ii00IiByeD0iMTIiIHJ5PSIyMCIgZmlsbD0idXJsKCNpbm5lck51dEdyYWQpIiBvcGFjaXR5PSIwLjUiLz4KICAgIDwvZz4KICAgIDwhLS0gR3JhaW4gMyAtLT4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI3MCwgMjUwKSByb3RhdGUoNTApIj4KICAgICAgPGVsbGlwc2UgY3g9IjAiIGN5PSIwIiByeD0iMTgiIHJ5PSIyNiIgZmlsbD0idXJsKCNudXRHcmFkKSIvPgogICAgICA8ZWxsaXBzZSBjeD0iLTMiIGN5PSItMyIgcng9IjExIiByeT0iMTciIGZpbGw9InVybCgjaW5uZXJOdXRHcmFkKSIgb3BhY2l0eT0iMC41Ii8+CiAgICA8L2c+CiAgPC9nPgoKICA8IS0tIEV0aXF1ZXR0ZSBQcm9kdWl0IC0tPgogIDxyZWN0IHg9IjUwIiB5PSIzMjUiIHdpZHRoPSIzMDAiIGhlaWdodD0iNDgiIHJ4PSIyNCIgZmlsbD0iI2MwNTYyMSIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMzU2IiBmb250LWZhbWlseT0iJ091dGZpdCcsICdTZWdvZSBVSScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BcmFjaGlkZXMgZHUgU8OpbmVnYWw8L3RleHQ+Cjwvc3ZnPg==' },
    { id: 'carottes', nom: 'Carottes', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop' },
    { id: 'pasteques', nom: 'Pastèques', url: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=300&h=300&fit=crop' },
    { id: 'mais', nom: 'Maïs local', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop' },
    { id: 'laitue', nom: 'Salade / Laitue', url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop' },
    { id: 'poivrons', nom: 'Poivrons verts', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&h=300&fit=crop' },
    { id: 'patates', nom: 'Patates Douces', url: 'https://images.unsplash.com/photo-1596450514735-31952e46b088?w=300&h=300&fit=crop' },
    { id: 'piment', nom: 'Piment rouge', url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=300&h=300&fit=crop' },
    { id: 'bananes', nom: 'Bananes Plantains', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop' },
    { id: 'citrons', nom: 'Citrons', url: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300&h=300&fit=crop' },
    { id: 'aubergines', nom: 'Aubergines', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=300&fit=crop' }
  ];

  @HostListener('window:storage')
  @HostListener('window:nouvelle-commande')
  onCommandeReceived() {
    this.chargerDashboardData();
  }

  selectIllustration(id: string) {
    this.illustrationSelectionnee = id;
    const item = this.illustrations.find(i => i.id === id);
    if (item) {
      this.nouveauProduit.image = item.url;
    }
  }

  constructor(
    private produitService: ProduitService,
    private commandeService: CommandeService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.chargerDashboardData();

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.ongletActif = params['tab'];
      } else {
        this.ongletActif = 'apercu';
      }
      this.cdr.detectChanges();
    });

    // Polling automatique toutes les 3 secondes pour réactualiser instantanément les commandes
    this.pollInterval = setInterval(() => {
      this.chargerDashboardData();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private deduplicateByName(items: any[]): any[] {
    if (!Array.isArray(items)) return [];
    const seen = new Set();
    return items.filter(item => {
      if (!item) return false;
      const key = item.nom ? item.nom.toLowerCase().trim() : String(item.id || JSON.stringify(item));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  chargerDashboardData() {
    this.produitService.getDashboard().subscribe({
      next: (res) => {
        if (res) {
          const nouvellesCommandes = res.commandes !== undefined ? res.commandes : 0;
          
          if (this.nombreCommandesPrecedent > 0 && nouvellesCommandes > this.nombreCommandesPrecedent) {
            this.nouvelleCommandeAlerte = true;
            setTimeout(() => (this.nouvelleCommandeAlerte = false), 6000);
          }
          this.nombreCommandesPrecedent = nouvellesCommandes;

          this.stats.commandes = nouvellesCommandes;
          this.stats.revenus = res.revenus !== undefined ? res.revenus : 0;
          this.stats.nombreAvis = res.nombre_avis !== undefined ? res.nombre_avis : (nouvellesCommandes > 0 ? nouvellesCommandes * 2 : 0);
          this.stats.note = res.note !== undefined ? res.note : (this.stats.nombreAvis > 0 ? 4.8 : 5.0);
          this.commandes = Array.isArray(res.dernieres_commandes) ? res.dernieres_commandes : [];
          
          if (Array.isArray(res.mes_produits)) {
            const rawProduits = res.mes_produits.map((p: any) => ({
              id: p.id,
              nom: p.nom,
              prix: p.prix,
              unite: p.unite || 'kg',
              stock: p.stock,
              categorie: p.categorie?.nom || 'Légumes',
              agriculteur: p.agriculteur?.user?.name || p.agriculteur?.nom || this.user?.name || 'Mon Exploitation',
              image: p.photo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop'
            }));
            this.produits = this.deduplicateByName(rawProduits);
            this.stats.produits = this.produits.length;
          }

          if (res.statut_validation) {
            if (!this.user) this.user = {};
            this.user.statut_validation = res.statut_validation;
            localStorage.setItem('user', JSON.stringify(this.user));
          }

          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  ouvrirModalForm() {
    const statut = this.user?.statut_validation;
    if (statut && statut !== 'validé') {
      alert("⏳ Votre compte agriculteur est actuellement en cours de vérification par l'administration AgroConnect.\n\nVous pourrez ajouter et publier vos récoltes dès que votre compte aura été validé par un administrateur.");
      this.afficherModalForm = false;
      return;
    }
    this.afficherModalForm = true;
  }

  ajouterProduit() {
    const statut = this.user?.statut_validation;
    if (statut && statut !== 'validé') {
      alert("⏳ Votre compte agriculteur est actuellement en cours de vérification par l'administration AgroConnect. Vous ne pouvez pas encore publier de récoltes.");
      this.afficherModalForm = false;
      return;
    }

    if (!this.nouveauProduit.nom || !this.nouveauProduit.prix) return;

    const nomSaisi = this.nouveauProduit.nom.trim().toLowerCase();
    
    // Détection de produit déjà existant dans le stock de l'agriculteur
    const produitExistant = this.produits.find(p => p.nom && p.nom.trim().toLowerCase() === nomSaisi);

    if (produitExistant) {
      const quantiteAjoutee = Number(this.nouveauProduit.stock || 0);
      const nouveauStock = Number(produitExistant.stock) + quantiteAjoutee;
      produitExistant.stock = nouveauStock;
      produitExistant.prix = this.nouveauProduit.prix;
      if (this.nouveauProduit.image) {
        produitExistant.image = this.nouveauProduit.image;
      }

      this.afficherModalForm = false;
      this.produitService.modifierProduit(produitExistant.id, {
        stock: nouveauStock,
        prix: this.nouveauProduit.prix
      }).subscribe({
        next: () => this.chargerDashboardData(),
        error: () => {}
      });

      alert(`Le produit "${produitExistant.nom}" figurait déjà dans votre inventaire. Son stock a été réapprovisionné de +${quantiteAjoutee} ${produitExistant.unite || 'kg'}. Nouveau stock total : ${nouveauStock} ${produitExistant.unite || 'kg'}.`);

      this.resetForm();
      return;
    }

    // Sauvegarde API
    const formData = new FormData();
    formData.append('nom', this.nouveauProduit.nom);
    formData.append('prix', this.nouveauProduit.prix.toString());
    formData.append('stock', this.nouveauProduit.stock.toString());
    formData.append('unite', this.nouveauProduit.unite);
    formData.append('categorie_id', '1');
    formData.append('photo', this.nouveauProduit.image);
    if (this.nouveauProduit.description) {
      formData.append('description', this.nouveauProduit.description);
    }

    this.afficherModalForm = false;

    this.produitService.creerProduit(formData).subscribe({
      next: () => {
        this.chargerDashboardData();
      },
      error: (err: any) => {
        const msg = err.error?.message || "Impossible de publier la récolte (compte en attente ou non autorisé).";
        alert(`❌ ${msg}`);
      }
    });

    this.resetForm();
  }

  reapprovisionnerStock(produit: any) {
    const qteStr = prompt(`Quantité à ajouter au stock de "${produit.nom}" (en ${produit.unite || 'kg'}) :`, '50');
    if (qteStr !== null) {
      const qte = parseInt(qteStr.trim(), 10);
      if (!isNaN(qte) && qte > 0) {
        const nouveauStock = Number(produit.stock) + qte;
        produit.stock = nouveauStock;

        this.produitService.modifierProduit(produit.id, { stock: nouveauStock }).subscribe({
          next: () => {
            this.chargerDashboardData();
          },
          error: () => {}
        });

        alert(`✓ Le stock de "${produit.nom}" a été augmenté avec succès (+${qte} ${produit.unite || 'kg'}). Nouveau stock : ${nouveauStock} ${produit.unite || 'kg'}.`);
      }
    }
  }

  resetForm() {
    this.nouveauProduit = {
      nom: '',
      nomLocal: '',
      region: 'Thiès',
      prix: 1000,
      unite: 'kg',
      stock: 100,
      categorie: 'Légumes',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop',
      description: 'Récolte fraîche du jour au Sénégal, sans produits chimiques nocifs.',
    };
  }

  supprimerProduit(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.produits = this.produits.filter(p => p.id !== id);
      this.stats.produits = this.produits.length;
      this.produitService.supprimerProduit(id).subscribe({
        next: () => {
          this.chargerDashboardData();
        },
        error: () => {}
      });
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop';
  }
}
