import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private trans: TranslationService) {}

  transform(key: string): string {
    return this.trans.translate(key);
  }
}
