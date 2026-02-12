import { OpenInNew } from '@mui/icons-material';
import { OphButton, OphLink } from '@opetushallitus/oph-design-system';

export type ExternalLinkProps = {
  name: string;
  href: string;
  underline?: 'hover' | 'always';
  variant?: 'contained' | 'text' | 'outlined';
};

export const ExternalLinkButton = ({
  name,
  href,
  variant = 'contained',
}: ExternalLinkProps) => {
  return (
    <OphButton
      endIcon={<OpenInNew />}
      href={href}
      variant={variant}
      target="_blank"
    >
      {name}
    </OphButton>
  );
};

export const ExternalLink = ({ name, href }: ExternalLinkProps) => {
  return (
    <OphLink href={href} iconVisible={true} target="_blank">
      {name}
    </OphLink>
  );
};

export const ExternalLinkParagraph = ({ name, href }: ExternalLinkProps) => {
  return (
    <OphLink
      href={href}
      iconVisible
      target="_blank"
      underline="always"
      sx={{ color: 'inherit', textDecorationColor: 'currentColor' }}
    >
      {name}
    </OphLink>
  );
};
