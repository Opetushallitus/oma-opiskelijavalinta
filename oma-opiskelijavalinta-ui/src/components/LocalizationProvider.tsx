import { useState } from 'react';
import { type TolgeeInstance, TolgeeProvider } from '@tolgee/react';
import { initTolgee } from '@/lib/localization/tolgee-config';
import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { UntranslatedFullSpinner } from './FullSpinner';
import { THEME_OVERRIDES } from '@/lib/theme';
import { Box } from '@mui/material';
import { getLanguage } from '@/lib/getLanguage';

export function LocalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tolgee, setTolgee] = useState<TolgeeInstance | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const userLang = getLanguage();
  initTolgee(userLang).then(setTolgee).catch(setError);

  if (error) {
    return <Box>Tolgee-käännöspalvelun alustaminen epäonnistui!</Box>;
  }

  return userLang && tolgee ? (
    <TolgeeProvider tolgee={tolgee} fallback={<UntranslatedFullSpinner />}>
      <OphThemeProvider
        variant="opintopolku"
        lang={userLang}
        overrides={THEME_OVERRIDES}
      >
        {children}
      </OphThemeProvider>
    </TolgeeProvider>
  ) : (
    <UntranslatedFullSpinner />
  );
}
