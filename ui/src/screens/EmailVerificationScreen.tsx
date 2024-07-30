import { useState, useEffect } from "react";
import { useTurnkey } from "@turnkey/sdk-react";
import { Branding } from "../components/Branding";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";

export const EmailVerificationScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { turnkey, authIframeClient } = useTurnkey();

  const [userEmail, setUserEmail] = useState<string>("");
  const [credentialBundle, setCredentialBundle] = useState<string>("");
  const [continueWith, setContinueWith] = useState<
    ("passkey" | "email") | undefined
  >(undefined);
  const [validationMode, setValidationMode] = useState<
    ("url" | "static" | "input") | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      if (credentialBundle && validationMode === "url" && authIframeClient) {
        await validateEmail();
      }
    })();
  }, [credentialBundle, authIframeClient]);

  const validateEmail = async () => {
    const response =
      await authIframeClient?.injectCredentialBundle(credentialBundle);
    if (response) {
      const verifyUserResponse = await fetch(
        `${turnkey?.config.serverSignUrl}/verify-user-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
          }),
        },
      );
      if (verifyUserResponse) {
        const loginResponse = await authIframeClient?.login();
        if (loginResponse?.organizationId) {
          if (continueWith === "passkey") {
            navigate("/add-passkey");
          } else if (continueWith === "email") {
            navigate("/create-wallet");
          }
        }
      }
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userEmail = queryParams.get("userEmail");
    const continueWith = queryParams.get("continueWith");
    const credentialBundle = queryParams.get("credentialBundle");

    if (userEmail) {
      setUserEmail(userEmail.replace(/ /g, "+"));
    }

    if (continueWith) {
      setContinueWith(continueWith as "passkey" | "email");
    }

    if (credentialBundle) {
      setValidationMode("url");
      setCredentialBundle(credentialBundle);
    } else {
      setValidationMode("static");
    }
  }, [location]);

  return (
    <div className="screen email-verification-screen">
      <div className="container-window">
        <Branding />
        {validationMode === "url" ? (
          <>
            <p className="message">Verifying credential</p>
            <Spinner spinnerType="Chase" />
          </>
        ) : null}
        {validationMode === "static" ? (
          <>
            <p className="message">
              Please validate your email by clicking the link sent to{" "}
              <span className="email">{userEmail}</span>.
            </p>
          </>
        ) : null}
        {validationMode === "input" ? (
          <>
            <p className="message">
              Please validate your email by pasting the code sent to{" "}
              <span className="email">{userEmail}</span>.
            </p>
            <div className="inject-credential">
              <input
                className="inject-credential-bundle"
                type="text"
                placeholder="Inject Credential Bundle"
                value={credentialBundle}
                onChange={(e) => setCredentialBundle(e.target.value)}
              />
            </div>
            <div className="action-buttons">
              <div
                className="action-button primary validate-email"
                onClick={validateEmail}
              >
                <p className="action-button-text">Validate</p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
