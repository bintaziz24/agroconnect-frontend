import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { AuthService } from '../../../services/auth';
import { ChatService, ChatMessage } from '../../../services/chat';
import { environment } from '../../../../environments/environment';

// Fix for Leaflet default icon paths in Angular CLI
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-livreur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private apiUrl = environment.apiUrl;

  user: any = null;
  menuActif = 'missions';
  livraisonConfirmee = false;
  livraisonRefusee = false;
  modalChatOuvert = false;
  nouveauMessage = '';

  stats = {
    weeklyGains: 0,
    coursesHonorees: 0,
    ponctualite: '100%',
    gainMoyen: 1000,
    performanceBonus: 0,
  };

  chatMessages: (ChatMessage & { estMe?: boolean })[] = [];

  missions: any[] = [];

  historiqueGains = [
    { jour: 'Lun', val: 0, h: 10 },
    { jour: 'Mar', val: 0, h: 10 },
    { jour: 'Mer', val: 0, h: 10 },
    { jour: 'Jeu', val: 0, h: 10 },
    { jour: 'Ven', val: 0, h: 10 },
    { jour: 'Sam', val: 0, h: 10 },
    { jour: 'Dim', val: 0, h: 10 },
  ];

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  chatSubscription: any = null;

  ngOnInit() {
    this.user = this.authService.getUser();
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.menuActif = params['tab'];
      } else {
        this.menuActif = 'missions';
      }
      this.cdr.detectChanges();
    });

    this.chargerChat('AGC-9021');
    this.chargerMissionsBackend();
  }

  chargerChat(missionId: string) {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
    this.chatSubscription = this.chatService.getMessagesObservable(missionId).subscribe((list) => {
      const currentUserName = this.user?.name || this.user?.nom || '';
      this.chatMessages = list.map(msg => ({
        ...msg,
        estMe: msg.role === 'DRIVER' || (currentUserName && msg.auteur.includes(currentUserName))
      }));
      this.cdr.detectChanges();
      this.scrollToBottom();
    });
  }

  mapInstance: any = null;

  chargerMissionsBackend() {
    this.http.get<any[]>(`${this.apiUrl}/livraisons`).subscribe({
      next: (list) => {
        if (Array.isArray(list) && list.length > 0) {
          const userId = this.user?.id;
          this.missions = list.map(liv => {
            const cmd = liv.commande || {};
            const client = cmd.client || {};
            const ligne = (cmd.lignes_commande && cmd.lignes_commande[0]) || {};
            const agriUser = ligne.produit?.agriculteur?.user || {};

            const estMienne = liv.livreur_id === userId;
            const estDisponible = !liv.livreur_id;

            return {
              id: 'AGC-' + cmd.id,
              realId: liv.id,
              livreurId: liv.livreur_id,
              estMienne,
              estDisponible,
              statut: liv.status === 'livree' ? 'Livrée avec succès' : (estMienne ? 'En cours de livraison' : 'Disponible'),
              origine: agriUser.name || 'Agriculteur Partenaire',
              origineRegion: agriUser.region || 'Thiès / Régions',
              originePhone: agriUser.telephone || '+221 77 000 00 00',
              destinataire: client.name || 'Client AgroConnect',
              destinataireAdresse: cmd.adresse_livraison || 'Sacré-Cœur 3, Dakar',
              destinatairePhone: client.telephone || '+221 77 000 00 00',
              gain: 1000,
              parcoursPct: liv.status === 'livree' ? 100 : 50,
            };
          });

          const mesMissions = this.missions.filter(m => m.estMienne);
          this.stats.weeklyGains = mesMissions.filter(m => m.statut.includes('Livrée')).length * 1000;
          this.stats.coursesHonorees = mesMissions.filter(m => m.statut.includes('Livrée')).length;

          if (this.missions[0] && this.missions[0].id) {
            this.chargerChat(this.missions[0].id);
          }

          this.cdr.detectChanges();
          setTimeout(() => this.initMap(), 300);
        } else {
          this.missions = [];
          this.stats.weeklyGains = 0;
          this.stats.coursesHonorees = 0;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.missions = [];
        this.stats.weeklyGains = 0;
        this.stats.coursesHonorees = 0;
        this.cdr.detectChanges();
      }
    });
  }

  accepterMission(mission: any) {
    if (!mission || !mission.realId) return;
    this.http.put(`${this.apiUrl}/livraisons/${mission.realId}`, {
      status: 'en_cours',
      livreur_id: this.user?.id
    }).subscribe({
      next: () => {
        this.chargerMissionsBackend();
      }
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private getGpsCoords(text: string): L.LatLngTuple {
    if (!text) return [14.7176, -17.4674]; // Dakar par défaut
    const txt = text.toLowerCase();

    if (txt.includes('ziguinchor') || txt.includes('casamance') || txt.includes('bignona') || txt.includes('oussouye')) {
      return [12.5833, -16.2719];
    }
    if (txt.includes('saint-louis') || txt.includes('saint louis') || txt.includes('richard') || txt.includes('dagana')) {
      return [16.0326, -16.4818];
    }
    if (txt.includes('kaolack') || txt.includes('nioro') || txt.includes('guinguineo')) {
      return [14.1333, -16.0833];
    }
    if (txt.includes('diourbel') || txt.includes('touba') || txt.includes('mbacke') || txt.includes('mbacké')) {
      return [14.6500, -16.2333];
    }
    if (txt.includes('fatick') || txt.includes('foundiougne')) {
      return [14.3333, -16.4167];
    }
    if (txt.includes('louga') || txt.includes('linguere') || txt.includes('kebemer')) {
      return [15.6167, -16.2167];
    }
    if (txt.includes('kolda') || txt.includes('velingara')) {
      return [12.8833, -14.9500];
    }
    if (txt.includes('tamba') || txt.includes('bakel')) {
      return [13.7689, -13.6673];
    }
    if (txt.includes('matam') || txt.includes('ranerou')) {
      return [15.6559, -13.2554];
    }
    if (txt.includes('kedougou') || txt.includes('kédougou')) {
      return [12.5556, -12.1744];
    }
    if (txt.includes('sedhiou') || txt.includes('sédhiou')) {
      return [12.7081, -15.5569];
    }
    if (txt.includes('thies') || txt.includes('thiès') || txt.includes('tienaba') || txt.includes('tiènaba') || txt.includes('tivaouane') || txt.includes('mbour') || txt.includes('saly')) {
      return [14.7910, -16.9255];
    }
    if (txt.includes('rufisque') || txt.includes('bargny') || txt.includes('diamniadio')) {
      return [14.7167, -17.2736];
    }
    // Dakar et communes
    return [14.7176, -17.4674];
  }

  private initMap() {
    const tryInit = (retries = 0) => {
      const mapContainer = document.getElementById('real-gps-map');
      if (!mapContainer) {
        if (retries < 12) {
          setTimeout(() => tryInit(retries + 1), 250);
        }
        return;
      }

      if (this.mapInstance) {
        try {
          this.mapInstance.remove();
        } catch (e) {}
        this.mapInstance = null;
      }

      const currentMission = this.missions && this.missions[0];
      const origRegion = currentMission ? (currentMission.origineRegion || currentMission.origine) : 'Thiès';
      const destAddress = currentMission ? (currentMission.destinataireAdresse || currentMission.destinataire) : 'Dakar';
      const origName = currentMission ? currentMission.origine : 'Producteur Partenaire';
      const destName = currentMission ? currentMission.destinataire : 'Client';

      const producerPos: L.LatLngTuple = this.getGpsCoords(origRegion);
      let clientPos: L.LatLngTuple = this.getGpsCoords(destAddress);

      // Si origine et destination pointent sur la même ville, décaler légèrement pour garder la visibilité des 2 marqueurs
      if (producerPos[0] === clientPos[0] && producerPos[1] === clientPos[1]) {
        clientPos = [producerPos[0] - 0.03, producerPos[1] - 0.03];
      }

      const livreurPos: L.LatLngTuple = [
        (producerPos[0] + clientPos[0]) / 2,
        (producerPos[1] + clientPos[1]) / 2
      ];

      this.mapInstance = L.map('real-gps-map', {
        zoomControl: true
      });

      // Adapter automatiquement la vue pour inclure à la fois le producteur et le client
      const bounds = L.latLngBounds([producerPos, clientPos]);
      this.mapInstance.fitBounds(bounds, { padding: [50, 50] });

      // CartoDB Voyager Tile Layer (Ultra-rapide & fiable)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '© OpenStreetMap © CARTO'
      }).addTo(this.mapInstance);

      // Icones customisées HTML SVG colorées
      const iconProducteur = L.divIcon({
        className: 'custom-map-pin-prod',
        html: '<div style="background:#1A7C4F; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">🌾</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const iconClient = L.divIcon({
        className: 'custom-map-pin-client',
        html: '<div style="background:#1B5EA6; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">🏠</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const iconLivreur = L.divIcon({
        className: 'custom-map-pin-livreur',
        html: '<div style="background:#E8A020; color:white; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:20px; border:3px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.4);">🚚</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      L.marker(producerPos, { icon: iconProducteur }).addTo(this.mapInstance)
        .bindPopup(`<b>🌾 Point d Enlèvement</b><br>${origName} (${origRegion})`);

      L.marker(clientPos, { icon: iconClient }).addTo(this.mapInstance)
        .bindPopup(`<b>🏠 Point de Livraison</b><br>${destName} (${destAddress})`);

      L.marker(livreurPos, { icon: iconLivreur }).addTo(this.mapInstance)
        .bindPopup(`<b>🚚 Livreur Express</b><br>Mission en cours pour ${destName}`)
        .openPopup();

      // Tracé d itinéraire (Polyline GPS)
      const routeWaypoints: L.LatLngTuple[] = [
        producerPos,
        livreurPos,
        clientPos
      ];

      L.polyline(routeWaypoints, {
        color: '#1A7C4F',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(this.mapInstance);

      this.mapInstance.invalidateSize();
      setTimeout(() => this.mapInstance?.invalidateSize(), 300);
      setTimeout(() => this.mapInstance?.invalidateSize(), 1000);
    };

    tryInit();
  }

  confirmerLivraison(mission?: any) {
    const target = mission || (this.missions && this.missions[0]);
    if (!target) return;
    target.statut = 'Livrée avec succès';
    this.livraisonConfirmee = true;
    this.livraisonRefusee = false;

    if (target.realId) {
      this.http.put(`${this.apiUrl}/livraisons/${target.realId}`, { status: 'livree' }).subscribe({
        next: () => this.chargerMissionsBackend()
      });
    }
  }

  estEnTrainDecrire = false;

  refuserLivraison(mission?: any) {
    const target = mission || (this.missions && this.missions[0]);
    if (!target) return;
    target.statut = 'Mission refusée';
    this.livraisonRefusee = true;
    this.livraisonConfirmee = false;

    if (target.realId) {
      this.http.put(`${this.apiUrl}/livraisons/${target.realId}`, { status: 'annulee' }).subscribe({
        next: () => this.chargerMissionsBackend()
      });
    }
  }

  getMissionId(mission?: any): string {
    const target = mission || (this.missions && this.missions[0]);
    if (!target || !target.id) return 'AGC-9021';
    const strId = String(target.id);
    return strId.startsWith('AGC-') ? strId : 'AGC-' + strId;
  }

  ouvrirChatModal(mission?: any) {
    this.modalChatOuvert = true;
    const currentMissionId = this.getMissionId(mission);
    this.chargerChat(currentMissionId);
    this.scrollToBottom();
  }

  envoyerMessage() {
    if (!this.nouveauMessage.trim()) return;
    const msgText = this.nouveauMessage.trim();
    const currentMissionId = this.getMissionId();
    const authorName = (this.user?.name || this.user?.nom || 'Livreur');

    this.chatService.sendMessage(
      currentMissionId,
      authorName.includes('Livreur') ? authorName : `${authorName} (Livreur)`,
      'DRIVER',
      msgText
    );
    this.nouveauMessage = '';
    this.scrollToBottom();
    this.cdr.detectChanges();
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('chat-messages-container');
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }
}
