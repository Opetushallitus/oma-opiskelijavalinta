import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { styled } from '@/lib/theme';
import { Box, List, ListItem } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

const BulletItem = styled(ListItem)(({ theme }) => ({
  display: 'list-item',
  marginLeft: theme.spacing(2.5),
  maxWidth: `calc(100% - ${theme.spacing(2.5)})`,
}));

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
    <List sx={{ listStyleType: 'disc' }}>
      {toiveet.map((toive) => (
        <BulletItem disablePadding key={`hakutoive-${toive.oid}`}>
          <HakutoiveName hakutoive={toive} />
        </BulletItem>
      ))}
    </List>
  );
}
