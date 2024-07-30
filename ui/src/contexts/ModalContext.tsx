import React, { createContext, useState, useContext } from "react";
import { ModalType } from "../types/modal";

import { ReceiveModal } from "../components/modals/ReceiveModal";
import {
  SendInitialModal,
  SendReviewModal,
} from "../components/modals/SendModals";
import { AddPasskeyModal } from "../components/modals/AddPasskeyModal";
import {
  RevealSeedPhraseDisclaimerModal,
  SelectExportTypeModal,
  WalletSeedPhraseModal,
  WalletAccountPrivateKeyModal,
} from "../components/modals/ExportModals";
import { ImportModal } from "../components/modals/ImportModal";

interface ModalContextProps {
  activeModal: ModalType;
  setActiveModal: (modalType: ModalType, modalProps?: any) => void;
}

export const ModalContext = createContext<ModalContextProps | undefined>(
  undefined,
);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeModal, setActiveModalState] = useState<ModalType>(
    ModalType.None,
  );
  const [activeModalProps, setActiveModalProps] = useState<any>({});

  const setActiveModal = (modalType: ModalType, modalProps?: any) => {
    setActiveModalState(modalType);
    setActiveModalProps(modalProps);
  };

  return (
    <ModalContext.Provider value={{ activeModal, setActiveModal }}>
      {children}
      {activeModal === ModalType.AddPasskey ? (
        <AddPasskeyModal {...activeModalProps} />
      ) : null}
      {activeModal === ModalType.Import ? (
        <ImportModal {...activeModalProps} />
      ) : null}
      {activeModal === ModalType.Receive ? (
        <ReceiveModal {...activeModalProps} />
      ) : null}
      {activeModal === ModalType.RevealSeedPhraseDisclaimer ? (
        <RevealSeedPhraseDisclaimerModal {...activeModalProps} />
      ) : null}
      {activeModal === ModalType.SelectExportType ? (
        <SelectExportTypeModal {...activeModalProps} />
      ) : null}
      {activeModal === ModalType.SendInitial ? (
        <SendInitialModal {...activeModalProps} />
      ) : null}
      {activeModal === ModalType.SendReview ? (
        <SendReviewModal {...activeModalProps} />
      ) : null}
      {activeModal === ModalType.WalletAccountPrivateKey ? (
        <WalletAccountPrivateKeyModal {...activeModalProps} />
      ) : null}
      {activeModal === ModalType.WalletSeedPhrase ? (
        <WalletSeedPhraseModal {...activeModalProps} />
      ) : null}
    </ModalContext.Provider>
  );
};
