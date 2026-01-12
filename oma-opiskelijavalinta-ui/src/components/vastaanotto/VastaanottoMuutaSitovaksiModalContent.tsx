import { Box, List, ListItem } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { styled } from '@/lib/theme';

const BulletItem = styled(ListItem)(({ theme }) => ({
  display: 'list-item',
  marginLeft: theme.spacing(2.5),
  maxWidth: `calc(100% - ${theme.spacing(2.5)})`,
}));

function HakutoiveContainer({ hakutoive }: { hakutoive: Hakukohde }) {
  const { translateEntity } = useTranslations();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <OphTypography sx={{ fontWeight: 'bolder' }}>
        {translateEntity(hakutoive.jarjestyspaikkaHierarkiaNimi)}
      </OphTypography>
      <OphTypography sx={{ fontWeight: 'bolder' }}>
        {translateEntity(hakutoive.nimi)}
      </OphTypography>
    </Box>
  );
}

export function VastaanottoMuutaSitovaksiModalContent({
  hakutoive,
  ylemmatToiveet,
}: {
  hakutoive: Hakukohde;
  ylemmatToiveet: Array<Hakukohde>;
}) {
  const { t } = useTranslations();

  return (
    <Box>
      <OphTypography>
        {t(
          ylemmatToiveet.length > 1
            ? 'vastaanotto.modaali.muuta-sitovaksi.info-ylemmat-toiveet'
            : 'vastaanotto.modaali.muuta-sitovaksi.info-ylempi-toive',
        )}
      </OphTypography>
      <List sx={{ listStyleType: 'disc' }}>
        {ylemmatToiveet.map((toive) => (
          <BulletItem disablePadding key={`ylempi-hakutoive-${toive.oid}`}>
            <HakutoiveContainer hakutoive={toive} />
          </BulletItem>
        ))}
      </List>
      <OphTypography>
        {t('vastaanotto.modaali.muuta-sitovaksi.info')}
      </OphTypography>
      <HakutoiveContainer hakutoive={hakutoive} />
    </Box>
  );
}
