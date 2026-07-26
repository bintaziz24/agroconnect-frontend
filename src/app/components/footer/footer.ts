import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="py-5 text-white-50" style="background: #0b1329; font-size: 13px; border-top: 1px solid #1e293b;">
      <div class="container">
        <div class="row g-4">
          <!-- Col 1: AgroConnect Info -->
          <div class="col-lg-4 col-md-6 text-start">
            <div class="d-flex align-items-center gap-2 mb-3">
              <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background: #1A7C4F;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" class="bi bi-leaf" viewBox="0 0 16 16">
                  <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708L7.293 10l-2.647 2.646a.5.5 0 0 0 .708.708L8 10.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 10l2.647-2.646z"/>
                </svg>
              </div>
              <span class="fs-4 fw-bold text-white" style="font-family: 'Playfair Display', serif;">AgroConnect</span>
            </div>
            <p class="mb-4 text-white-50" style="line-height: 1.6;">
              {{ t('foot_desc') }}
            </p>
            <h6 class="text-white fw-bold text-uppercase mb-3" style="font-size: 11px; letter-spacing: 0.05em;">{{ t('foot_payment') }}</h6>
            <div class="d-flex gap-2 flex-wrap mb-4">
              <span class="badge px-2 py-1.5 text-dark rounded-1 d-inline-flex align-items-center gap-1.5" style="background-color: #40c4ff !important; font-size: 11px; font-weight: 600;">
                <img src="/assets/wave.png" alt="Wave" style="width: 14px; height: 14px; object-fit: contain; border-radius: 2px;">
                Wave
              </span>
              <span class="badge px-2 py-1.5 text-white rounded-1 d-inline-flex align-items-center gap-1.5" style="background-color: #ea580c !important; font-size: 11px; font-weight: 600;">
                <img src="/assets/om.png" alt="Orange Money" style="width: 14px; height: 14px; object-fit: contain; border-radius: 2px;">
                Orange Money
              </span>
              <span class="badge px-3 py-2 text-white rounded-1" style="background-color: #dc2626 !important; font-size: 11px;">Free Money 🔴</span>
              <span class="badge px-3 py-2 text-white rounded-1" style="background-color: #059669 !important; font-size: 11px;">Espèces à la Livraison 💵</span>
            </div>
          </div>
          
          <!-- Col 2: Regions -->
          <div class="col-lg-2 col-md-6 text-start">
            <h6 class="text-white fw-bold text-uppercase mb-3 pb-2 position-relative" style="font-size: 12px; letter-spacing: 0.05em;">
              {{ t('foot_regions') }}
              <span class="position-absolute bottom-0 start-0 bg-success" style="width: 30px; height: 2px;"></span>
            </h6>
            <ul class="list-unstyled d-flex flex-column gap-2">
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Dakar & Banlieue') }}</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Zone des Niayes (Thiès)') }}</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Vallée du Fleuve (Saint-Louis)') }}</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Bassin Arachidier (Kaolack)') }}</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Casamance (Ziguinchor, Sédhiou)') }}</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Sénégal Oriental (Tambacounda)') }}</a></li>
            </ul>
          </div>

          <!-- Col 3: Solutions -->
          <div class="col-lg-3 col-md-6 text-start">
            <h6 class="text-white fw-bold text-uppercase mb-3 pb-2 position-relative" style="font-size: 12px; letter-spacing: 0.05em;">
              {{ t('Solutions Agro') }}
              <span class="position-absolute bottom-0 start-0 bg-success" style="width: 30px; height: 2px;"></span>
            </h6>
            <ul class="list-unstyled d-flex flex-column gap-2">
              <li><a routerLink="/register" class="fw-semibold text-decoration-none hover-white" style="color: #FFA000;">{{ t('Espace Producteurs (Vendre ses récoltes)') }}</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Réseau de Livreurs (Devenir livreur)') }}</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Espace Restaurants & Grossistes') }}</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Normes Quality & Produits Bio') }}</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none hover-white">{{ t('Tarification & Commissions') }}</a></li>
            </ul>
          </div>

          <!-- Col 4: Contact -->
          <div class="col-lg-3 col-md-6 text-start">
            <h6 class="text-white fw-bold text-uppercase mb-3 pb-2 position-relative" style="font-size: 12px; letter-spacing: 0.05em;">
              {{ t('Contact Sénégal') }}
              <span class="position-absolute bottom-0 start-0 bg-success" style="width: 30px; height: 2px;"></span>
            </h6>
            <ul class="list-unstyled d-flex flex-column gap-3">
              <li class="d-flex align-items-start gap-2">
                <span>📍</span>
                <span>{{ t('Immeuble Agropole, Sacré-Cœur, Dakar') }}</span>
              </li>
              <li class="d-flex align-items-start gap-2">
                <span>📞</span>
                <div>
                  <span class="d-block text-white">+221 33 800 00 00</span>
                  <span class="text-white-50" style="font-size: 11px;">WhatsApp: +221 77 000 00 00</span>
                </div>
              </li>
              <li class="d-flex align-items-start gap-2">
                <span>✉️</span>
                <a href="mailto:contact@agroconnect.sn" class="text-white-50 text-decoration-none hover-white">contact@agroconnect.sn</a>
              </li>
              <li class="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-secondary">
                <span>🛡️</span>
                <span class="fw-bold text-success" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.02em;">{{ t('100% Produits Agricoles d\'Origine Sénégal') }}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr class="my-4 border-secondary opacity-25">
        
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2" style="font-size: 12px;">
          <p class="mb-0">{{ t('© 2026 AgroConnect Sénégal. Tous droits réservés.') }}</p>
          <p class="mb-0">{{ t('Fait avec ❤️ pour les agriculteurs et consommateurs du Sénégal.') }}</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .hover-white:hover {
      color: white !important;
      transition: color 0.2s;
    }
  `]
})
export class FooterComponent {
  constructor(public trans: TranslationService) {}

  t(key: string): string {
    return this.trans.translate(key);
  }
}
