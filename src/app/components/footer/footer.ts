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
                <div class="d-flex flex-column gap-1">
                  <a href="tel:+221765512974" class="text-white text-decoration-none hover-white fw-bold d-inline-flex align-items-center gap-1.5" style="font-size: 13px;">
                    <span>📞 Appeler :</span> +221 76 551 29 74
                  </a>
                  <a href="https://wa.me/221765512974?text=Bonjour%20AgroConnect%2C%20je%20souhaite%20avoir%20des%20informations." target="_blank" class="text-white-50 text-decoration-none hover-white d-inline-flex align-items-center gap-1.5" style="font-size: 12px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#25D366" class="bi bi-whatsapp" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.93c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.165-.395-.333-.34-.445-.345l-.379-.007c-.133 0-.346.05-.526.248-.18.198-.69.674-.69 1.643 0 .97.705 1.916.804 2.047.099.133 1.391 2.124 3.37 2.98.47.203.837.324 1.123.416.473.15.903.129 1.243.078.38-.058 1.17-.478 1.336-.94.166-.463.166-.86.116-.94-.049-.08-.182-.129-.38-.228z"/>
                    </svg>
                    <span>WhatsApp :</span> +221 76 551 29 74
                  </a>
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
