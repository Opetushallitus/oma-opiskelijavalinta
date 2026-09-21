import { useTranslations } from '@/hooks/useTranslations';
import { OpenInNew } from '@mui/icons-material';
import { OphButton, OphLink } from '@opetushallitus/oph-design-system';

export type ExternalLinkProps = {
  name: string;
  href: string;
  underline?: 'hover' | 'always';
  variant?: 'contained' | 'text' | 'outlined';
  accessibleName?: string;
  title?: string;
};

export const ExternalLinkButton = ({
  name,
  href,
  variant = 'contained',
  accessibleName,
  title,
}: ExternalLinkProps) => {
  const { t } = useTranslations();

  return (
    <OphButton
      endIcon={<OpenInNew />}
      href={href}
      variant={variant}
      target="_blank"
      aria-label={
        accessibleName ??
        `${name}${t('saavutettavuus.linkki-uusi-ikkuna-oletus-loppuosa')}`
      }
      title={title ?? name}
    >
      {name}
    </OphButton>
  );
};

export const ExternalLink = ({
  name,
  href,
  accessibleName,
  title,
}: ExternalLinkProps) => {
  const { t } = useTranslations();

  return (
    <OphLink
      href={href}
      iconVisible={true}
      target="_blank"
      aria-label={
        accessibleName ??
        `${name}${t('saavutettavuus.linkki-uusi-ikkuna-oletus-loppuosa')}`
      }
      title={title ?? name}
    >
      {name}
    </OphLink>
  );
};

export const ExternalLinkParagraph = ({
  name,
  href,
  accessibleName,
  title,
}: ExternalLinkProps) => {
  const { t } = useTranslations();

  return (
    <OphLink
      href={href}
      iconVisible
      target="_blank"
      underline="always"
      sx={{ color: 'inherit', textDecorationColor: 'currentColor' }}
      aria-label={
        accessibleName ??
        `${name}${t('saavutettavuus.linkki-uusi-ikkuna-oletus-loppuosa')}`
      }
      title={title ?? name}
    >
      {name}
    </OphLink>
  );
};
