import { styled } from '@/lib/theme';
import { Box, List, ListItem } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

const StyledBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const BulletItem = styled(ListItem)(({ theme }) => ({
  display: 'list-item',
  marginLeft: theme.spacing(2.5),
  '::marker': {
    fontSize: 'small',
    verticalAlign: 'top',
    lineHeight: 'inherit',
  },
}));

export default function HomePage() {
  return (
    <Box>
      <OphTypography variant="h1">Oma Opiskelijavalinta</OphTypography>
      <StyledBox>
        <OphTypography variant="body1">
          Muokkaa hakemustasi ja seuraa valinnan etenemistä. Hakemussivulla voit
        </OphTypography>
        <List sx={{ listStyleType: 'disc' }}>
          <BulletItem disablePadding>
            tarkastella hakemuksiasi ja muokata niitä hakuaikana
          </BulletItem>
          <BulletItem disablePadding>
            lisätä liitteitä hakemuksellesi määräaikaan mennessä
          </BulletItem>
          <BulletItem disablePadding>
            nähdä opiskelijavalinnan tulokset
          </BulletItem>
          <BulletItem disablePadding>ottaa opiskelupaikan vastaan</BulletItem>
        </List>
      </StyledBox>
    </Box>
  );
}
