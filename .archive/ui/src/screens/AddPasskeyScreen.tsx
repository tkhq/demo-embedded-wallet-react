import { Branding } from "../components/Branding";
import { useNavigate, useLocation } from "react-router-dom";
import { useTurnkey } from "@turnkey/sdk-react";

import fingerprint from "../assets/fingerprint.svg";
import ellipse from "../assets/ellipse.png";

export const AddPasskeyScreen: React.FC = () => {
  const { turnkey, passkeyClient, authIframeClient } = useTurnkey();
  const location = useLocation();
  const navigate = useNavigate();

  const addPasskey = async () => {
    const currentUser = await turnkey?.getCurrentUser();

    const credential = await passkeyClient?.createUserPasskey({
      publicKey: {
        user: {
          name: currentUser?.username,
          displayName: currentUser?.username,
        },
      },
    });

    if (credential) {
      const createAuthenticatorsResponse =
        await authIframeClient?.createAuthenticators({
          authenticators: [
            {
              authenticatorName: "Default Authenticator",
              challenge: credential.encodedChallenge,
              attestation: credential.attestation,
            },
          ],
          userId: `${currentUser?.userId}`,
        });

      navigate("/create-wallet");
    }
  };

  return (
    <div className="screen add-passkey-screen">
      <div className="container-window">
        <Branding />
        <p className="title">Add a passkey</p>
        <p className="subtitle">
          Follow your browser's prompts to add a passkey to your wallet.
        </p>
        <div
          className="passkey-hero"
          style={{
            backgroundImage: `url(${ellipse})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <img className="passkey-image" src={fingerprint} />
          <p className="passkey-info">
            Passkeys are a new way to sign into your account using biometrics.
            They are more secure than traditional passwords, and offer a
            convenient way to sign using your wallet.
          </p>
        </div>
        <div className="action-buttons">
          <div
            className="action-button primary add-passkey"
            onClick={addPasskey}
          >
            <p className="action-button-text">Add a passkey</p>
          </div>
          <div
            className="action-button secondary cancel"
            onClick={() => navigate("/create-wallet")}
          >
            <p className="action-button-text">Cancel</p>
          </div>
        </div>
      </div>
    </div>
  );
};
