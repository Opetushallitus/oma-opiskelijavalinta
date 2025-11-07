import { type TFnType, useTolgee, useTranslate } from '@tolgee/react';
import type { Language } from '@/types/ui-types';
import { useCallback } from 'react';
import type { TranslatedName } from '@/lib/localization/localization-types';
import { translateName } from '@/lib/localization/translation-utils';

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

  return {
    t,
    translateEntity,
    getLanguage: getLanguage as () => Language,
  };
};
