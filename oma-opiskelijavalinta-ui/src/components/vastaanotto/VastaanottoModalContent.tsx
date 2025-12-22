import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { VastaanottoTilaToiminto } from '@/lib/valinta-tulos-types';
import type { Hakukohde } from '@/lib/kouta-types';

export const VastaanottoModalParams: Record<
  VastaanottoTilaToiminto,
  { info: string; title: string; confirmLabel: string; successMessage: string }
> = {
  [VastaanottoTilaToiminto.PERU]: {
    title: 'vastaanotto.modaali.peru.otsikko',
    confirmLabel: 'vastaanotto.modaali.peru.vahvista',
    info: 'vastaanotto.modaali.peru.info',
    successMessage: 'vastaanotto.modaali.peru.onnistui',
  },
  [VastaanottoTilaToiminto.VASTAANOTA_SITOVASTI]: {
    title: 'vastaanotto.modaali.vastaanota-sitovasti.otsikko',
    confirmLabel: 'vastaanotto.modaali.vastaanota-sitovasti.vahvista',
    info: 'vastaanotto.modaali.vastaanota-sitovasti.info',
    successMessage: 'vastaanotto.modaali.vastaanota-sitovasti.onnistui',
  },
  //TODO: nämä toteutetaan myöhemmissä tiketeissä
  [VastaanottoTilaToiminto.VASTAANOTA_EHDOLLISESTI]: {
    title: '',
    confirmLabel: '',
    info: '',
    successMessage: '',
  },
  [VastaanottoTilaToiminto.VASTAANOTA_SITOVASTI_PERU_ALEMMAT]: {
    title: '',
    confirmLabel: '',
    info: '',
    successMessage: '',
  },
} as const;

export function VastaanottoModalContent({
  hakutoive,
  modalParams,
}: {
  hakutoive: Hakukohde;
  modalParams: { info: string; title: string; confirmLabel: string };
}) {
  const { t, translateEntity } = useTranslations();

  return (
    <Box>
      <OphTypography>{t(modalParams.info)}</OphTypography>
      <OphTypography sx={{ fontWeight: 'bolder' }}>
        {translateEntity(hakutoive.jarjestyspaikkaHierarkiaNimi)}
      </OphTypography>
      <OphTypography sx={{ fontWeight: 'bolder' }}>
        {translateEntity(hakutoive.nimi)}
      </OphTypography>
    </Box>
  );
}
