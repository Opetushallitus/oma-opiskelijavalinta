import { OphTypography } from '@opetushallitus/oph-design-system';
import { PaperWithTopColor } from '../PaperWithTopColor';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { type Application } from '@/lib/application.service';
import { isTruthy } from 'remeda';
import { ExternalLinkButton } from '../ExternalLink';

const StyledPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'start',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
}));

export function FormOnlyApplicationContainer({
  application,
}: {
  application: Application;
}) {
  const { t, translateEntity } = useTranslations();

  return (
    <StyledPaper tabIndex={0}>
      <OphTypography variant="h3">
        {translateEntity(application?.formName)}
      </OphTypography>
      {isTruthy(application.modifyLink) && (
        <ExternalLinkButton
          href={application.modifyLink ?? ''}
          name={t('hakemukset.nayta')}
        />
      )}
    </StyledPaper>
  );
}
