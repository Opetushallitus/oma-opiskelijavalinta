import React from 'react';
import type { Hakemus } from '@/lib/hakemus-types';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  OphButton,
  ophColors,
  OphLink,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import CloseIcon from '@mui/icons-material/Close';

const PanelContent = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing(2),
      }}
    >
      {children}
    </Box>
  );
};

const StatusRow = ({ status }: { status: 'paid' | 'okByProxy' }) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const statusColors = {
    backgroundColor: '#E2FAE4',
    text: ophColors.green1,
  };

  return (
    <>
      <OphTypography
        style={{
          textAlign: 'left',
          margin: theme.spacing(1.5, 2, 1.5, 0),
        }}
      >
        {t('kk-hakemusmaksu.info-dialog.tila')}
      </OphTypography>
      <Box
        style={{
          padding: theme.spacing(0.5, 1, 0.5, 1),
          fontWeight: '600',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          width: 'min-content',
          margin: theme.spacing(1, 0, 1, 0),
          backgroundColor: statusColors.backgroundColor,
          color: statusColors.text,
        }}
      >
        {t(`kk-hakemusmaksu.tila.${status}`)}
      </Box>
    </>
  );
};

const Separator = () => {
  return (
    <span
      style={{
        gridColumn: 'span 2',
        borderBottom: '1px solid #cecfd0',
      }}
    ></span>
  );
};

const MaksuRow = ({
  name,
  value,
  bold,
}: {
  name: string;
  value: React.ReactNode;
  bold?: boolean;
}) => {
  const theme = useTheme();

  return (
    <>
      <OphTypography
        style={{
          textAlign: 'left',
          margin: theme.spacing(1, 2, 1, 0),
        }}
      >
        {name}
      </OphTypography>
      <OphTypography
        style={{
          textAlign: 'left',
          margin: theme.spacing(1, 0, 1, 0),
          fontWeight: bold ? 'bold' : 'initial',
        }}
      >
        {value}
      </OphTypography>
    </>
  );
};

export default function KkHakemusmaksuInfo({ hakemus }: { hakemus: Hakemus }) {
  const { t } = useTranslations();
  const theme = useTheme();

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (hakemus.paymentState === 'paid' || hakemus.paymentState === 'okByProxy')
    return (
      <>
        <OphLink
          component={'button'}
          underline="hover"
          onClick={handleOpen}
          sx={{ translate: '0 -1px' }}
        >
          {t('kk-hakemusmaksu.tiedot')}
        </OphLink>
        <Dialog
          open={open}
          title={t('kk-hakemusmaksu.info-dialog.otsikko')}
          scroll={'paper'}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          maxWidth="md"
        >
          <DialogTitle
            variant={'h1'}
            id="modal-modal-title"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {t('kk-hakemusmaksu.info-dialog.otsikko')}
            <IconButton
              aria-label={t('yleinen.sulje')}
              onClick={handleClose}
              sx={{
                color: ophColors.grey900,
                alignSelf: 'flex-start',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent id="modal-modal-description" sx={{ pt: 0, pr: 6 }}>
            <PanelContent>
              <OphTypography>
                {t('kk-hakemusmaksu.info-dialog.kuvaus')}
              </OphTypography>
              <Box style={{ backgroundColor: ophColors.grey50 }}>
                <Box
                  style={{
                    display: 'grid',
                    justifyContent: 'space-between',
                    gridTemplateColumns: '3fr 7fr',
                    margin: theme.spacing(0, 2),
                    paddingBottom: theme.spacing(1.5),
                  }}
                >
                  <StatusRow status={hakemus.paymentState} />
                  {hakemus.paymentSum && (
                    <>
                      <Separator />
                      <MaksuRow
                        name={t('kk-hakemusmaksu.maara')}
                        value={`${hakemus.paymentSum}€`}
                        bold
                      />
                    </>
                  )}

                  {hakemus.haku?.alkamiskausi && hakemus.haku?.alkamisvuosi && (
                    <>
                      <Separator />
                      <MaksuRow
                        name={t('kk-hakemusmaksu.voimassa')}
                        value={t(
                          `kk-hakemusmaksu.alkamiskausi.${hakemus.haku.alkamiskausi}`,
                          { alkamisvuosi: hakemus.haku.alkamisvuosi },
                        )}
                      />
                    </>
                  )}
                </Box>
              </Box>
              <OphButton
                sx={{ marginLeft: 'auto' }}
                onClick={handleClose}
                variant="contained"
              >
                {t('yleinen.sulje')}
              </OphButton>
            </PanelContent>
          </DialogContent>
        </Dialog>
      </>
    );
  else return null;
}
