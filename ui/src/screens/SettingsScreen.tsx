import { useState, useEffect } from "react";
import { useTurnkey } from "@turnkey/sdk-react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../hooks/useModal";
import { useFlashMessage } from "../hooks/useFlashMessage";
import { ModalType } from "../types/modal";

import closeIcon from "../assets/close-icon.svg";
import emailIcon from "../assets/email-icon.svg";

interface SettingsScreenProps {
  currentUser: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser = undefined,
}) => {
  const navigate = useNavigate();
  const { turnkey, getActiveClient } = useTurnkey();
  const { setActiveModal } = useModal();
  const { setFlashMessage } = useFlashMessage();

  const [authenticators, setAuthenticators] = useState<any[]>([]);

  useEffect(() => {
    if (turnkey) {
      (async () => {
        const currentUserSession = await turnkey?.currentUserSession();
        if (currentUserSession) {
          const currentUser = await turnkey?.getCurrentUser();
          const authenticatorsResponse =
            await currentUserSession.getAuthenticators({
              userId: `${currentUser?.userId}`,
            });
          setAuthenticators(authenticatorsResponse.authenticators);
        } else {
          navigate("/");
        }
      })();
    }
  }, [turnkey]);

  const removeAuthenticator = async (authenticator: any) => {
    const currentUser = await turnkey?.getCurrentUser();
    const activeClient = await getActiveClient();
    const authenticatorResponse = await activeClient?.deleteAuthenticators({
      userId: `${currentUser?.userId}`,
      authenticatorIds: [authenticator.authenticatorId],
    });
    if (authenticatorResponse) {
      const nextAuthenticators = authenticators.filter(
        (x) => x.authenticatorId !== authenticator.authenticatorId,
      );
      setAuthenticators(nextAuthenticators);
      setFlashMessage({
        message: "Successfully removed authenticator",
        type: "success",
      });
    }
  };

  return (
    <div className="settings-screen">
      <div className="settings-container">
        <h3 className="login-methods">Login methods</h3>
        <div className="settings-section email-section">
          <h4 className="section-title-text">Email</h4>
          <div className="emails">
            <div className="email">
              <img className="email-icon" src={emailIcon} />
              <p className="email-title">Email</p>
              <div className="flex-spacer" />
              <p className="email-value">{currentUser?.username}</p>
            </div>
          </div>
        </div>
        <div className="settings-section passkeys-section">
          <div className="section-title">
            <h4 className="section-title-text">Passkeys</h4>
            <div className="flex-spacer" />
            <div
              className="action-button primary section-title-action"
              onClick={() => setActiveModal(ModalType.AddPasskey)}
            >
              <p className="action-button-text">Add Passkey</p>
            </div>
          </div>
          <div className="authenticators">
            {authenticators.map((authenticator, index) => {
              const authenticatorCreatedAt = new Date(
                authenticator.createdAt.seconds * 1000,
              );
              return (
                <div className="authenticator" key={`authenticator-${index}`}>
                  <p className="authenticator-created-at">
                    {authenticatorCreatedAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="authenticator-name">
                    {authenticator.authenticatorName}
                  </p>
                  <div className="flex-spacer" />
                  <img
                    className="remove-authenticator"
                    src={closeIcon}
                    onClick={() => removeAuthenticator(authenticator)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
