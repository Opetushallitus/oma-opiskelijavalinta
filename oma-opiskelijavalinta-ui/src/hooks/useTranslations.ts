import { type TFnType, useTolgee, useTranslate } from '@tolgee/react';
import type { Language } from '@/types/ui-types';

export type TFunction = TFnType;

export const useTranslations = () => {
  const { getLanguage } = useTolgee(['language']);
  const { t } = useTranslate();

  return {
    t,
    getLanguage: getLanguage as () => Language,
  };
};
