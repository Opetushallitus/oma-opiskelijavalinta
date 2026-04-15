import type { Language } from '@/types/ui-types';
import Cookies from 'js-cookie';

function getLanguageOrDefault(lng: string): Language {
  const lowered = lng.toLowerCase();
  return ['fi', 'sv', 'en'].includes(lowered) ? (lowered as Language) : 'fi';
}

export const getLanguageFromHost = (): Language => {
  const parts = document.location.host.split('.');
  const domain = parts.at(-2);

  if (!domain) {
    return getLanguageOrDefault(navigator.language);
  }

  if (domain.includes('studieinfo')) return 'sv';
  if (domain.includes('studyinfo')) return 'en';
  return 'fi';
};

export function getLanguage(): Language {
  // opintopolku.fi sets lang cookie
  const lang = Cookies.get('lang');
  if (lang) {
    return getLanguageOrDefault(lang);
  }
  return getLanguageFromHost();
}

// oppija-raamit calls this function to show selected language
export function getLang(): string {
  return getLanguage().valueOf();
}
