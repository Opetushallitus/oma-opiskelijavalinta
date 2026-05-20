import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { T } from '@tolgee/react';
import { styled } from '@/lib/theme';
import { HakutoiveName } from '../hakukohde/HakutoiveName';
import { naytetaankoPeruuntuvatOpiskelupaikat } from './vastaanotto-utils';
import { PaatettavatOikeudetInfo } from './PaatettavatOikeudetInfo';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';

const ModalBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(1.5),
}));

export function VastaanottoModalContent({
  hakutoive,
  modalParams,
  tulos,
}: {
  hakutoive: Hakukohde;
  modalParams: {
    info: string;
    title: string;
    confirmLabel: string;
    info2?: string;
  };
  tulos: HakutoiveenTulos;
}) {
  const { t } = useTranslations();

  return (
    <ModalBox>
      <OphTypography>{t(modalParams.info)}</OphTypography>
      <HakutoiveName hakutoive={hakutoive} />
      {modalParams.info2 && (
        <OphTypography>
          <T
            keyName={modalParams.info2}
            params={{
              br: <br />,
            }}
          ></T>
        </OphTypography>
      )}
      {naytetaankoPeruuntuvatOpiskelupaikat(tulos) && (
        <PaatettavatOikeudetInfo
          oikeudet={tulos.paatettavatOpiskeluOikeudet}
          showLink={false}
        />
      )}
    </ModalBox>
  );
}
