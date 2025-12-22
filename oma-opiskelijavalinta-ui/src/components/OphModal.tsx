import { useTranslations } from '@/hooks/useTranslations';
import { notDesktop, styled } from '@/lib/theme';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
} from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useId } from 'react';

export type OphModalProps = Pick<
  DialogProps,
  'open' | 'children' | 'maxWidth' | 'fullWidth'
> & {
  titleAlign?: 'center' | 'left';
  contentAlign?: 'center' | 'left';
  children?: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
  disabled?: boolean;
  onClose?: (
    event: unknown,
    reason: 'backdropClick' | 'escapeKeyDown' | 'closeButtonClick',
  ) => void;
};

const StyledDialogContent = styled(DialogContent)(() => ({
  maxWidth: 'min(100% - 10px, 800px)',
  position: 'relative',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  [notDesktop(theme)]: {
    flexDirection: 'column',
    button: {
      width: '100%',
      '&:not(style)': {
        marginLeft: 0,
      },
    },
    rowGap: theme.spacing(2),
  },
}));

export const OphModal = ({
  open,
  titleAlign = 'left',
  contentAlign = 'left',
  children,
  actions,
  title,
  fullWidth = true,
  onClose,
  disabled,
}: OphModalProps) => {
  const modalId = useId();
  const modalTitleId = `${modalId}-title`;
  const { t } = useTranslations();
  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth="md"
      sx={{ minWidth: 'min(100%, 500px)' }}
      open={open}
      aria-labelledby={modalTitleId}
      onClose={(event, reason) => {
        if (reason && reason === 'backdropClick') {
          return;
        } else if (onClose) {
          onClose(event, reason);
        }
      }}
      disableEscapeKeyDown={true}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          columnGap: 1,
        }}
        id={modalTitleId}
      >
        <Box sx={{ textAlign: titleAlign, flexGrow: 1 }}>{title}</Box>
        {onClose && (
          <OphButton
            startIcon={<CloseIcon />}
            aria-label={t('yleinen.sulje')}
            onClick={() => onClose({}, 'closeButtonClick')}
            disabled={disabled}
            sx={{
              color: ophColors.grey600,
              alignSelf: 'flex-start',
              padding: 0,
            }}
          />
        )}
      </DialogTitle>
      <StyledDialogContent sx={{ textAlign: contentAlign }}>
        {children}
      </StyledDialogContent>
      {actions && <StyledDialogActions>{actions}</StyledDialogActions>}
    </Dialog>
  );
};
