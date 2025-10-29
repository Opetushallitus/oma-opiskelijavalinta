import type { Language } from '@/types/ui-types';
import Cookies from 'js-cookie';

function getLanguageOrDefault(lng: string): Language {
  const lowered = lng.toLowerCase();
  return ['fi', 'sv', 'en'].includes(lowered) ? (lowered as Language) : 'fi';
}

export function getLanguage(): Language {
  // opintopolku.fi sets lang cookie
  const lang = Cookies.get('lang');
  if (lang) {
    return getLanguageOrDefault(lang);
  }
  return getLanguageOrDefault(navigator.language);
}
