import { useState } from "react";
import { useTurnkey } from "@turnkey/sdk-react";
import { useNavigate, Link } from "react-router-dom";
import { IframeStamper, TurnkeySDKApiTypes } from "@turnkey/sdk-browser";

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { turnkey, passkeyClient, authIframeClient } = useTurnkey();

  const [email, setEmail] = useState<string>("");
  const [credentialBundle, setCredentialBundle] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<"INITIAL" | "VERIFY_EMAIL">(
    "INITIAL",
  );

  const loginWithPasskey = async () => {
    const response = await passkeyClient?.login();
    if (response?.organizationId) {
      navigate("/dashboard");
    }
  };

  const loginWithEmail = async () => {
    setCurrentStep("VERIFY_EMAIL");
    const subOrgIds: TurnkeySDKApiTypes.TGetSubOrgIdsResponse =
      await turnkey?.serverSign("getSubOrgIds", [
        {
          filterType: "EMAIL",
          filterValue: email,
        },
      ])!;

    if (subOrgIds.organizationIds?.length > 0) {
      const emailAuthResponse = await turnkey?.serverSign("emailAuth", [
        {
          email: email,
          targetPublicKey: `${authIframeClient?.iframePublicKey}`,
          organizationId: subOrgIds.organizationIds[0],
        },
      ]);
    }
  };

  const injectCredentialBundle = async () => {
    const response =
      await authIframeClient?.injectCredentialBundle(credentialBundle);
    if (response) {
      const loginResponse = await authIframeClient?.login();

      if (loginResponse?.organizationId) {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="screen login-screen">
      <div className="login-container">
        {currentStep === "INITIAL" ? (
          <>
            <div className="login-section login-form-section">
              <p className="title-text">Log in</p>

              <input
                className="email-input"
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="action-buttons">
                <div
                  className="action-button primary"
                  onClick={loginWithPasskey}
                >
                  <p className="action-button-text">Login with Passkey</p>
                </div>
                <div className="flex-spacer" />
                <div className="action-button primary" onClick={loginWithEmail}>
                  <p className="action-button-text">Login with Email</p>
                </div>
              </div>

              <Link to="/signup" className="link">
                Signup
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="please-validate-text">
              {`Please validate your email by clicking the link sent to `}
              <span>{email}</span>
            </p>

            <div className="inject-credential">
              <input
                className="inject-credential-input"
                type="text"
                placeholder="Inject Credential Bundle"
                value={credentialBundle}
                onChange={(e) => setCredentialBundle(e.target.value)}
              />
              <div
                className="action-button primary"
                onClick={injectCredentialBundle}
              >
                <p className="action-button-text">Authenticate</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
