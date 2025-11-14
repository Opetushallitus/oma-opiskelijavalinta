import { OpenInNew } from '@mui/icons-material';
import { OphButton } from '@opetushallitus/oph-design-system';

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
