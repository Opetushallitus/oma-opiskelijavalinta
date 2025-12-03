import { ophColors } from '@opetushallitus/oph-design-system';
import {
  styled as muiStyled,
  type Theme,
  type ThemeOptions,
} from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';

export { ophColors } from '@opetushallitus/oph-design-system';

export const hyvaksyttyBackground = '#E2FAE4';
export const hylattyBackground = '#EECFC5';
export const keskenBackground = '#FAE6A8';

const withTransientProps = (propName: string) =>
  // Emotion doesn't support transient props by default so add support manually
  shouldForwardProp(propName) && !propName.startsWith('$');

export const styled: typeof muiStyled = (
  tag: Parameters<typeof muiStyled>[0],
  options: Parameters<typeof muiStyled>[1] = {},
) => {
  return muiStyled(tag, {
    shouldForwardProp: (propName: string) =>
      (!options.shouldForwardProp || options.shouldForwardProp(propName)) &&
      withTransientProps(propName),
    ...options,
  });
};

export const greenBadgeBackground = '#E2FAE4';
export const redBadgeBackground = '#EECFC5';
export const yellowBadgeBackground = '#FAE6A8';

export const DEFAULT_BOX_BORDER = `2px solid ${ophColors.grey100}`;

export const notLarge = (theme: Theme) => theme.breakpoints.down('lg');

export const THEME_OVERRIDES: ThemeOptions = {};
