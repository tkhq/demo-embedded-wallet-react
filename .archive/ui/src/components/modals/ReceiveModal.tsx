import React from "react";
import QRCode from "qrcode.react";
import { useModal } from "../../hooks/useModal";
import { useFlashMessage } from "../../hooks/useFlashMessage";
import { ModalType } from "../../types/modal";

import copyIcon from "../../assets/copy-icon.svg";
import { displayTruncatedAddress } from "../../helpers";

interface ReceiveModalProps {
  walletAccount: any;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  walletAccount = undefined,
}) => {
  const { setActiveModal } = useModal();
  const { setFlashMessage } = useFlashMessage();

  const closeModalIfElementClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      setActiveModal(ModalType.None);
    }
  };

  return (
    <div className="Modal receive" onClick={closeModalIfElementClick}>
      <div className="modal-content">
        <div className="modal-title-container">
          <p className="modal-title">Receive</p>
          <p className="modal-subtitle">Receive funds at the address below.</p>
        </div>
        <div className="modal-body">
          <div className="wallet-qr-code">
            <QRCode
              value={walletAccount?.address}
              className="qr-code"
              size={150}
            />
          </div>

          <div className="wallet-account">
            <p className="wallet-account-text">{walletAccount?.address}</p>
            <p className="wallet-account-text-mobile">
              {displayTruncatedAddress(walletAccount?.address)}
            </p>
            <img
              onClick={() => {
                navigator.clipboard.writeText(walletAccount?.address);
                setFlashMessage({
                  message: "Copied wallet address",
                  type: "success",
                });
              }}
              className="copy-icon"
              src={copyIcon}
            />
          </div>

          <div className="action-buttons">
            <div
              className="action-button secondary"
              onClick={() => setActiveModal(ModalType.None)}
            >
              <p className="action-button-text">Cancel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
