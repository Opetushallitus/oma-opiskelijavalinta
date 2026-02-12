import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { BulletedList, BulletItem } from '../BulletedList';

export function HakutoiveName({ hakutoive }: { hakutoive: Hakukohde }) {
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

export function HakutoiveList({ toiveet }: { toiveet: Array<Hakukohde> }) {
  return (
    <BulletedList>
      {toiveet.map((toive) => (
        <BulletItem key={`hakutoive-${toive.oid}`}>
          <HakutoiveName hakutoive={toive} />
        </BulletItem>
      ))}
    </BulletedList>
  );
}
