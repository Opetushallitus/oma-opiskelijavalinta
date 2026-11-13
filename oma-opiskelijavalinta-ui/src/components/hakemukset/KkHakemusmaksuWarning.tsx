import type { Hakemus } from '@/lib/hakemus-types';
import { WarningBox } from '@/components/WarningBox';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ErrorBox } from '@/components/ErrorBox';
import { Box, useTheme } from '@mui/material';
import React from 'react';
import { ExternalLinkButton } from '@/components/ExternalLink';
import {
  formatHakemusmaksuDate,
  isHakemusmaksuEraantynyt,
  isHakemusmaksuMaksamatta,
} from '@/lib/kk-hakemusmaksu-utils';

function StatusHeader({
  text,
  statusColors,
}: {
  text: string;
  statusColors: { background: string; text: string };
}) {
  const theme = useTheme();

  return (
    <Box
      style={{
        padding: theme.spacing(0, 1, 0, 1),
        fontWeight: '600',
        fontSize: '14px',
        whiteSpace: 'nowrap',
        width: 'min-content',
        margin: theme.spacing(1, 0, 1, 0),
        backgroundColor: statusColors.background,
        color: statusColors.text,
      }}
    >
      {text}
    </Box>
  );
}

function Maksamatta({ hakemus }: { hakemus: Hakemus }) {
  const { t } = useTranslations();

  return (
    <WarningBox noIcon sx={{ width: '100%' }}>
      <StatusHeader
        text={t('kk-hakemusmaksu.otsikko.maksamatta')}
        statusColors={{ background: '#F7E7AF', text: '#5F360F' }}
      />
      <OphTypography>{t('kk-hakemusmaksu.kuvaus.maksamatta')}</OphTypography>
      <br />
      <OphTypography>
        {t('kk-hakemusmaksu.maara')}:{' '}
        <span style={{ fontWeight: 'bold' }}>{hakemus.paymentSum}€</span>
        {hakemus.paymentDueDate && (
          <>
            {' '}
            &bull; {t('kk-hakemusmaksu.erapaiva')}:{' '}
            {formatHakemusmaksuDate(hakemus.paymentDueDate)}
          </>
        )}
        {hakemus.haku?.alkamiskausi && hakemus.haku?.alkamisvuosi && (
          <>
            {' '}
            &bull; {t('kk-hakemusmaksu.voimassa')}{' '}
            {t(`kk-hakemusmaksu.alkamiskausi.${hakemus.haku.alkamiskausi}`, {
              alkamisvuosi: hakemus.haku.alkamisvuosi,
            })}
          </>
        )}
      </OphTypography>

      {hakemus.paymentLink && (
        <>
          <br />
          <ExternalLinkButton
            name={t('kk-hakemusmaksu.maksulinkki')}
            href={hakemus.paymentLink}
          />
        </>
      )}
    </WarningBox>
  );
}

function Myohassa({ hakemus }: { hakemus: Hakemus }) {
  const { t } = useTranslations();

  return (
    <ErrorBox noIcon sx={{ width: '100%' }}>
      <StatusHeader
        text={t('kk-hakemusmaksu.otsikko.eraantynyt')}
        statusColors={{ background: '#E9D0C6', text: ophColors.grey900 }}
      />
      <OphTypography>{t('kk-hakemusmaksu.kuvaus.eraantynyt')}</OphTypography>
      <br />
      <OphTypography>
        {t('kk-hakemusmaksu.maara')}:{' '}
        <span style={{ fontWeight: 'bold' }}>{hakemus.paymentSum}€</span>
        {hakemus.paymentDueDate && (
          <>
            {' '}
            &bull; {t('kk-hakemusmaksu.erapaiva')}:{' '}
            {formatHakemusmaksuDate(hakemus.paymentDueDate)}
          </>
        )}
      </OphTypography>
    </ErrorBox>
  );
}

export default function KkHakemusmaksuWarning({
  hakemus,
}: {
  hakemus: Hakemus;
}) {
  if (isHakemusmaksuMaksamatta(hakemus.paymentState)) {
    return <Maksamatta hakemus={hakemus} />;
  } else if (isHakemusmaksuEraantynyt(hakemus.paymentState)) {
    return <Myohassa hakemus={hakemus} />;
  }
  return null;
}
