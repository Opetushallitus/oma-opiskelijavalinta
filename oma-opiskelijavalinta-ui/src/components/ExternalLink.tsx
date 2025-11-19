import { OpenInNew } from '@mui/icons-material';
import { OphButton, OphLink } from '@opetushallitus/oph-design-system';

export type ExternalLinkProps = {
  name: string;
  href: string;
};

export const ExternalLinkButton = ({ name, href }: ExternalLinkProps) => {
  return (
    <OphButton
      endIcon={<OpenInNew />}
      href={href}
      variant="contained"
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
