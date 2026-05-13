import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { HakutoiveName, HakutoiveList } from '../hakukohde/HakutoiveName';
import { styled } from '@/lib/theme';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { naytetaankoPeruuntuvatOpiskelupaikat } from './vastaanotto-utils';
import { PaatettavatOikeudetInfo } from './PaatettavatOikeudetInfo';

const ModalBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(1.5),
}));

export function VastaanottoMuutaSitovaksiModalContent({
  hakutoive,
  ylemmatToiveet,
  tulos,
}: {
  hakutoive: Hakukohde;
  ylemmatToiveet: Array<Hakukohde>;
  tulos: HakutoiveenTulos;
}) {
  const { t } = useTranslations();

  return (
    <ModalBox>
      <OphTypography>
        {t(
          ylemmatToiveet.length > 1
            ? 'vastaanotto.modaali.muuta-sitovaksi.info-ylemmat-toiveet'
            : 'vastaanotto.modaali.muuta-sitovaksi.info-ylempi-toive',
        )}
      </OphTypography>
      {ylemmatToiveet.length > 1 && <HakutoiveList toiveet={ylemmatToiveet} />}
      {ylemmatToiveet.length === 1 && ylemmatToiveet[0] && (
        <HakutoiveName hakutoive={ylemmatToiveet[0]} />
      )}
      <OphTypography>
        {t('vastaanotto.modaali.muuta-sitovaksi.info')}
      </OphTypography>
      <HakutoiveName hakutoive={hakutoive} />
      {naytetaankoPeruuntuvatOpiskelupaikat(tulos) && (
        <PaatettavatOikeudetInfo
          oikeudet={tulos.paatettavatOpiskeluOikeudet}
          showLink={false}
        />
      )}
    </ModalBox>
  );
}
