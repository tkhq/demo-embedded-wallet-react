import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { ModalType } from "../../types/modal";
import { useTurnkey } from "@turnkey/sdk-react";
import { useFlashMessage } from "../../hooks/useFlashMessage";
import { useNavigate } from "react-router-dom";

interface AddPasskeyModalProps {}

export const AddPasskeyModal: React.FC<AddPasskeyModalProps> = ({}) => {
  const { turnkey, passkeyClient, getActiveClient } = useTurnkey();
  const navigate = useNavigate();
  const { setActiveModal } = useModal();
  const { setFlashMessage } = useFlashMessage();
  const [passkeyName, setPasskeyName] = useState<string>("");

  const closeModalIfElementClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      setActiveModal(ModalType.None);
    }
  };

  const addPasskey = async () => {
    const currentUser = await turnkey?.getCurrentUser();
    const activeClient = await getActiveClient();

    const credential = await passkeyClient?.createUserPasskey({
      publicKey: {
        user: {
          name: currentUser?.username,
          displayName: currentUser?.username,
        },
      },
    });

    if (credential) {
      const authenticatorsResponse = await activeClient?.createAuthenticators({
        authenticators: [
          {
            authenticatorName: passkeyName,
            challenge: credential.encodedChallenge,
            attestation: credential.attestation,
          },
        ],
        userId: `${currentUser?.userId}`,
      });

      if (authenticatorsResponse?.activity.id) {
        setFlashMessage({
          message: "Successfully added authenticator",
          type: "success",
        });
        setActiveModal(ModalType.None);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  };

  return (
    <div className="Modal add-passkey" onClick={closeModalIfElementClick}>
      <div className="modal-content">
        <div className="modal-title-container">
          <p className="modal-title">Add Passkey</p>
          <p className="modal-subtitle">
            Help identify your passkey by giving it a unique name.
          </p>
        </div>

        <div className="modal-body">
          <div className="passkey-name-section">
            <p className="label">Passkey name</p>
            <input
              type="text"
              placeholder="Type a name"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
            />
          </div>

          <div className="action-buttons">
            <div className="action-button primary" onClick={addPasskey}>
              <p className="action-button-text">Add Passkey</p>
            </div>
            <div
              className="action-button quaternary"
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
