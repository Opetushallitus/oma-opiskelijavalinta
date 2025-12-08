import { type TFnType, useTolgee, useTranslate } from '@tolgee/react';
import type { Language } from '@/types/ui-types';
import { useCallback } from 'react';
import type {
  TranslatedDescription,
  TranslatedName,
} from '@/lib/localization/localization-types';
import {
  translateDescription,
  translateName,
} from '@/lib/localization/translation-utils';

export type TFunction = TFnType;

export const useTranslations = () => {
  const { getLanguage } = useTolgee(['language']);
  const { t } = useTranslate();

  const translateEntity = useCallback(
    (translateable?: TranslatedName) => {
      return translateable
        ? translateName(translateable, getLanguage() as Language)
        : '';
    },
    [getLanguage],
  );

  const translateStatusDescription = useCallback(
    (value?: TranslatedDescription) => {
      const lang = getLanguage() as Language;
      return value ? translateDescription(value, lang) : '';
    },
    [getLanguage],
  );

  return {
    t,
    translateEntity,
    translateStatusDescription,
    getLanguage: getLanguage as () => Language,
  };
};
