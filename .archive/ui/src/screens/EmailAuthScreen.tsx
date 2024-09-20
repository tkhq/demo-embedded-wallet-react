import { useState, useEffect } from "react";
import { useTurnkey } from "@turnkey/sdk-react";
import { Branding } from "../components/Branding";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";

export const EmailAuthScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authIframeClient } = useTurnkey();

  const [userEmail, setUserEmail] = useState<string>("");
  const [credentialBundle, setCredentialBundle] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (credentialBundle && authIframeClient) {
        await loginWithEmail();
      }
    })();
  }, [credentialBundle, authIframeClient]);

  const loginWithEmail = async () => {
    const response =
      await authIframeClient?.injectCredentialBundle(credentialBundle);
    if (response) {
      const loginResponse = await authIframeClient?.login();
      if (loginResponse?.organizationId) {
        navigate("/dashboard");
      }
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userEmail = queryParams.get("userEmail");
    const credentialBundle = queryParams.get("credentialBundle");

    if (userEmail) {
      setUserEmail(userEmail.replace(/ /g, "+"));
    }

    if (credentialBundle) {
      setCredentialBundle(credentialBundle);
    }
  }, [location]);

  return (
    <div className="screen email-auth-screen">
      <div className="container-window">
        <Branding />
        {credentialBundle ? (
          <>
            <p className="message">Verifying credential</p>
            <Spinner spinnerType="Chase" />
          </>
        ) : null}
        {!credentialBundle ? (
          <p className="message">
            Login by clicking the link sent to{" "}
            <span className="email">{userEmail}</span>.
          </p>
        ) : null}
      </div>
    </div>
  );
};

{
  /* <div className="inject-credential">
<input
  className="inject-credential-bundle"
  type="text"
  placeholder="Inject Credential Bundle"
  value={credentialBundle}
  onChange={(e) => setCredentialBundle(e.target.value)} />
</div>
<div className="action-buttons">
<div
  className="action-button primary login-with-email"
  onClick={loginWithEmail}>
  <p className="action-button-text">Login</p>
</div>
</div> */
}
