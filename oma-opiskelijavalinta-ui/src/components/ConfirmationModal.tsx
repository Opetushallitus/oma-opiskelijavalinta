import { OphButton } from '@opetushallitus/oph-design-system';
import { OphModal } from './OphModal';
import { useTranslations } from '@/hooks/useTranslations';
import React from 'react';
import type { UseMutationResult } from '@tanstack/react-query';

export type ConfirmationModalProps = {
  title: string;
  open: boolean;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  mutation: UseMutationResult<void, Error, void, unknown>;
  loading?: boolean;
  confirmLabel: string;
  maxWidth?: 'sm' | 'md' | false;
};

type ConfirmationModalContextValue = {
  showConfirmation: (
    props: Omit<ConfirmationModalProps, 'open' | 'onConfirm'>,
  ) => void;
  hideConfirmation: () => void;
};

export const ConfirmationModalContext =
  React.createContext<ConfirmationModalContextValue | null>(null);

export const ConfirmationModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [modalProps, setModalProps] =
    React.useState<ConfirmationModalProps | null>(null);

  const contextValue: ConfirmationModalContextValue = React.useMemo(
    () => ({
      showConfirmation: (props) =>
        setModalProps({
          ...props,
          onConfirm: () => {
            setModalProps({ ...props, loading: true, open: true });
            props.loading = true;
            props.mutation.mutate(undefined, {
              onSettled: () => setModalProps(null),
            });
          },
          onCancel: () => {
            props.onCancel?.();
            setModalProps(null);
          },
          open: true,
        }),
      hideConfirmation: () => setModalProps(null),
    }),
    [setModalProps],
  );

  return (
    <ConfirmationModalContext value={contextValue}>
      {modalProps && <ConfirmationModal {...modalProps} />}
      {children}
    </ConfirmationModalContext>
  );
};

const ConfirmationModal = ({
  title,
  open,
  content,
  onConfirm,
  onCancel,
  confirmLabel,
  maxWidth = 'md',
  loading,
}: ConfirmationModalProps) => {
  const { t } = useTranslations();

  return (
    <OphModal
      open={open}
      onClose={onCancel}
      title={t(title)}
      maxWidth={maxWidth}
      disabled={loading}
      actions={
        <>
          <OphButton variant="outlined" onClick={onCancel} disabled={loading}>
            {t('yleinen.peruuta')}
          </OphButton>
          <OphButton variant="contained" onClick={onConfirm} loading={loading}>
            {t(confirmLabel)}
          </OphButton>
        </>
      }
    >
      {content}
    </OphModal>
  );
};

export const useGlobalConfirmationModal = () => {
  const context = React.use(ConfirmationModalContext);
  if (!context) {
    throw new Error(
      'useGlobalConfirmationModal must be used within a ConfirmationModalProvider',
    );
  }
  return context;
};
