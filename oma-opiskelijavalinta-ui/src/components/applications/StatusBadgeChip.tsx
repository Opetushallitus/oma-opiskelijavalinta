import { Chip } from '@mui/material';
import {
  greenBadgeBackground,
  redBadgeBackground,
  yellowBadgeBackground,
} from '@/lib/theme';
import { ophColors } from '@opetushallitus/oph-design-system';

export const BadgeColors = {
  green: {
    color: ophColors.green1,
    background: greenBadgeBackground,
  },
  blue: {
    background: ophColors.lightBlue2,
    color: ophColors.cyan1,
  },
  yellow: {
    background: yellowBadgeBackground,
    color: ophColors.orange1,
  },
  red: {
    background: redBadgeBackground,
    color: ophColors.grey900,
  },
  grey: {
    background: ophColors.grey300,
    color: ophColors.grey900,
  },
} as const;

export type BadgeColor = keyof typeof BadgeColors;

export const BadgeColorKey = {
  Green: 'green',
  Blue: 'blue',
  Yellow: 'yellow',
  Red: 'red',
  Grey: 'grey',
} as const;

export type BadgeProps = {
  label: string;
  color: BadgeColor;
};

export function StatusBadgeChip({ badgeProps }: { badgeProps: BadgeProps }) {
  const badgeColor = BadgeColors[badgeProps.color];

  return (
    <Chip
      label={badgeProps.label}
      sx={{
        backgroundColor: badgeColor.background,
        color: badgeColor.color,
        fontWeight: 'bold',
        borderRadius: '0px',
        mt: '0px',
      }}
    />
  );
}
