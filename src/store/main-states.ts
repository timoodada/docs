import { Jinx, Spells, Boom } from '@/store/core';
import { of } from 'rxjs';

const config = require('../../config');

const LANG = '__es_guide_language__';

@Jinx<string>('language', '')
class Language extends Spells<string> {
  init(lang?: string) {
    this.set(lang || sessionStorage.getItem(LANG) || config.i18n.defaultLang);
  }

  setLangSilent(lang: string) {
    sessionStorage.setItem(LANG, lang);
  }

  @Boom
  setLang(lang: string) {
    this.setLangSilent(lang);
    return of(lang);
  }
}
export const language = new Language();
