import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Branding } from "../components/Branding";
import { useKeyPress } from "../hooks/useKeyPress";
import { useTurnkey } from "@turnkey/sdk-react";
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils';
import { TurnkeySDKApiTypes } from "@turnkey/sdk-browser";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  useGoogleLogin,
} from "@react-oauth/google";

import checkboxCircle from "../assets/checkbox-circle.svg";

const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL!;

const getMagicLinkTemplate = (action: string, email: string, method: string) =>
  `${FRONTEND_URL}/email-${action}?userEmail=${email}&continueWith=${method}&credentialBundle=%s`;

export const LandingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const { turnkey, passkeyClient, authIframeClient } = useTurnkey();

  const handleGoogleLogin = async (response: any) => {
    let targetSubOrgId;

    const subOrgIds: TurnkeySDKApiTypes.TGetSubOrgIdsResponse =
      await turnkey?.serverSign("getSubOrgIds", [
        {
          filterType: "OIDC_TOKEN",
          filterValue: response.credential,
        },
      ])!;

    targetSubOrgId = subOrgIds.organizationIds[0];

    if (subOrgIds.organizationIds.length == 0) {
      const subOrganizationConfig: TurnkeySDKApiTypes.TCreateSubOrganizationBody =
        {
          subOrganizationName: email,
          rootUsers: [
            {
              userName: "",
              userEmail: "",
              oauthProviders: [
                {
                  providerName: "Google Auth - Embedded Wallet",
                  oidcToken: response.credential,
                },
              ],
              apiKeys: [],
              authenticators: [],
            },
          ],
          rootQuorumThreshold: 1,
        };

      const createSubOrganizationResponse = (await turnkey?.serverSign(
        "createSubOrganization",
        [subOrganizationConfig],
      )) as TurnkeySDKApiTypes.TCreateSubOrganizationResponse;

      targetSubOrgId = createSubOrganizationResponse.subOrganizationId;
    }

    const oauthResponse: TurnkeySDKApiTypes.TOauthResponse =
      await turnkey?.serverSign("oauth", [
        {
          oidcToken: response.credential,
          targetPublicKey: `${authIframeClient?.iframePublicKey}`,
          organizationId: targetSubOrgId,
        },
      ])!;

    const credentialResponse = await authIframeClient?.injectCredentialBundle(
      oauthResponse.credentialBundle,
    );

    if (credentialResponse) {
      const loginResponse = await authIframeClient?.login();
      if (loginResponse?.organizationId) {
        navigate("/dashboard");
      }
    }
  };

  useKeyPress("Enter", () => {
    continueWithPasskey();
  });

  const continueWithPasskey = async () => {
    if (!email) {
      return;
    }
    const response = await fetch(
      `${turnkey?.config.serverSignUrl}/find-user-by-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      },
    );
    const userData = await response.json();
    if (userData.user) {
      if (userData.user.emailVerified || userData.user.emailverified) {
        // TODO: perform migration to make this consistent
        const response = await passkeyClient?.login();
        if (response?.organizationId) {
          navigate("/dashboard");
        }
      } else {
        navigate(`/email-verification?userEmail=${email}&continueWith=passkey`);
      }
    } else {
      const subOrganizationConfig: TurnkeySDKApiTypes.TCreateSubOrganizationBody =
        {
          subOrganizationName: email,
          rootUsers: [
            {
              userName: email,
              userEmail: email,
              apiKeys: [],
              authenticators: [],
              oauthProviders: [],
            },
          ],
          rootQuorumThreshold: 1,
        };

      const createSubOrganizationResponse = (await turnkey?.serverSign(
        "createSubOrganization",
        [subOrganizationConfig],
      )) as TurnkeySDKApiTypes.TCreateSubOrganizationResponse;

      if (createSubOrganizationResponse.subOrganizationId) {
        const emailAuthResponse = await turnkey?.serverSign("emailAuth", [
          {
            email: email,
            targetPublicKey: `${authIframeClient?.iframePublicKey}`,
            organizationId: createSubOrganizationResponse.subOrganizationId,
            emailCustomization: {
              magicLinkTemplate: getMagicLinkTemplate(
                "verification",
                email,
                "passkey",
              ),
            },
          },
        ]);

        if (emailAuthResponse) {
          const addUserResponse = await fetch(
            `${turnkey?.config.serverSignUrl}/add-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email,
                subOrganizationId:
                  createSubOrganizationResponse.subOrganizationId,
              }),
            },
          );
        }
      }

      navigate(`/email-verification?userEmail=${email}&continueWith=passkey`);
    }
  };

  const continueWithEmail = async () => {
    if (email === "") {
      return;
    }

    const response = await fetch(
      `${turnkey?.config.serverSignUrl}/find-user-by-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      },
    );

    const userData = await response.json();

    if (userData.user) {
      if (userData.user.emailVerified || userData.user.emailverified) {
        const emailAuthResponse = await turnkey?.serverSign("emailAuth", [
          {
            email: email,
            targetPublicKey: `${authIframeClient?.iframePublicKey}`,
            organizationId:
              userData.user.subOrganizationId ??
              userData.user.suborganizationid, // TODO: migrate to make this consistent
            emailCustomization: {
              magicLinkTemplate: getMagicLinkTemplate("auth", email, "email"),
            },
          },
        ]);
        navigate(`/email-auth?userEmail=${email}`);
      } else {
        navigate(`/email-verification?userEmail=${email}&continueWith=email`);
      }
    } else {
      const subOrganizationConfig: TurnkeySDKApiTypes.TCreateSubOrganizationBody =
        {
          subOrganizationName: email,
          rootUsers: [
            {
              userName: email,
              userEmail: email,
              apiKeys: [],
              authenticators: [],
              oauthProviders: [],
            },
          ],
          rootQuorumThreshold: 1,
        };

      const createSubOrganizationResponse = (await turnkey?.serverSign(
        "createSubOrganization",
        [subOrganizationConfig],
      )) as TurnkeySDKApiTypes.TCreateSubOrganizationResponse;

      if (createSubOrganizationResponse.subOrganizationId) {
        const emailAuthResponse = await turnkey?.serverSign("emailAuth", [
          {
            email: email,
            targetPublicKey: `${authIframeClient?.iframePublicKey}`,
            organizationId: createSubOrganizationResponse.subOrganizationId,
            emailCustomization: {
              magicLinkTemplate: getMagicLinkTemplate(
                "verification",
                email,
                "email",
              ),
            },
          },
        ]);

        if (emailAuthResponse) {
          const addUserResponse = await fetch(
            `${turnkey?.config.serverSignUrl}/add-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email,
                subOrganizationId:
                  createSubOrganizationResponse.subOrganizationId,
              }),
            },
          );
        }
      }

      navigate(`/email-verification?userEmail=${email}&continueWith=email`);
    }
  };

  return (
    <div className="screen landing-screen">
      <div className="split-content-secondary">
        <div className="features">
          <div className="feature">
            <div className="feature-title">
              <img className="checkbox-circle" src={checkboxCircle} />
              <p className="primary-text">Non-custodial</p>
            </div>
            <p className="secondary-text">
              Only you can access your private keys.
            </p>
          </div>
          <div className="feature">
            <div className="feature-title">
              <img className="checkbox-circle" src={checkboxCircle} />
              <p className="primary-text">Passwordless</p>
            </div>
            <p className="secondary-text">
              No need to remember a password or seed phrase. Authentication
              methods include email, passkeys,{" "}
              <a
                href="https://docs.turnkey.com/passkeys/introduction"
                target="_blank"
              >
                and more.
              </a>
            </p>
          </div>
          <div className="feature">
            <div className="feature-title">
              <img className="checkbox-circle" src={checkboxCircle} />
              <p className="primary-text">Secure</p>
            </div>
            <p className="secondary-text">
              Scalable, institutional-grade security. View our security
              documentation{" "}
              <a
                href="https://docs.turnkey.com/category/security"
                target="_blank"
              >
                here.
              </a>
            </p>
          </div>
          <div className="feature">
            <div className="feature-title">
              <img className="checkbox-circle" src={checkboxCircle} />
              <p className="primary-text">Open-source</p>
            </div>
            <p className="secondary-text">
              Curious about how this is built? Check out the code for yourself{" "}
              <a
                href="https://github.com/tkhq/demo-embedded-wallet"
                target="_blank"
              >
                here.
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="split-content-primary">
        <div className="container-window">
          <Branding />
          <p className="title">Log in or sign up</p>
          <div className="labeled-input email">
            <p className="label">Email address</p>
            <input
              className="email-input"
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
            />
          </div>

          <div className="action-buttons">
            <div
              className={`action-button primary ${
                email ? "" : "disabled"
              } continue-passkey`}
              onClick={continueWithPasskey}
            >
              <p className="action-button-text">Continue with passkey</p>
            </div>
            <div
              className={`action-button tertiary ${
                email ? "" : "disabled"
              } continue-email`}
              onClick={email ? () => continueWithEmail() : undefined}
            >
              <p className="action-button-text">Continue with email</p>
            </div>
            <div
              className="action-buttons"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
            { authIframeClient?.iframePublicKey ?
              <GoogleOAuthProvider
                clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID!}
              >
                <GoogleLogin nonce={bytesToHex(sha256(authIframeClient.iframePublicKey))} onSuccess={handleGoogleLogin} useOneTap />
              </GoogleOAuthProvider> : null
            }
            </div>
            <div
              className={`action-button tertiary lost-access`}
              onClick={continueWithEmail}
            >
              <p className="action-button-text">
                Lost access to your passkey? Recover your wallet here.
              </p>
            </div>
          </div>

          <p className="container-sub-footer">
            By continuing, you agree to Turnkey's{" "}
            <a href="https://www.turnkey.com/legal/terms" target="_blank">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="https://www.turnkey.com/legal/privacy" target="_blank">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
