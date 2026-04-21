import { useTranslations } from '@/hooks/useTranslations';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { ErrorBox } from '@/components/ErrorBox';

export function EiOpiskelupaikkaaInfo() {
  const { t } = useTranslations();

  return (
    <ErrorBox>
      <OphTypography>{t('tulos.info.kaikki-hylatty')}</OphTypography>
    </ErrorBox>
  );
}
