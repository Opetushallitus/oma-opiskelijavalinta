import type { Hakemus } from '@/lib/hakemus-types';
import { WarningBox } from '@/components/WarningBox';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ErrorBox } from '@/components/ErrorBox';
import { Box, useTheme } from '@mui/material';
import React from 'react';
import { getLanguage } from '@/lib/getLanguage';
import { toFormattedDateStringWithLocale } from '@/lib/localization/translation-utils';
import { ExternalLinkButton } from '@/components/ExternalLink';

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
      {/*
          <Box
          style={{
            height: '10px',
            width: '10px',
            borderRadius: '50%',
            display: 'inline-block',
            marginRight: theme.spacing(1),
            backgroundColor: statusColors.dot,
          }}

        ></Box>*/}
      {text}
    </Box>
  );
}

function formatDate(date: string) {
  const lang = getLanguage();
  const [year, month, day] = date.split('-');
  return toFormattedDateStringWithLocale(
    Number(year),
    Number(month),
    Number(day),
    lang,
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
            {formatDate(hakemus.paymentDueDate)}
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
            {formatDate(hakemus.paymentDueDate)}
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
  if (hakemus.paymentState === 'awaiting') {
    return <Maksamatta hakemus={hakemus} />;
  } else if (hakemus.paymentState === 'overdue') {
    return <Myohassa hakemus={hakemus} />;
  }
  return null;
}
