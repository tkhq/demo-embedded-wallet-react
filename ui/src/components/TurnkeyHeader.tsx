import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Branding } from "./Branding";
import { useTurnkey } from "@turnkey/sdk-react";
import { useNavigate } from "react-router-dom";
import { useFlashMessage } from "../hooks/useFlashMessage";
import { displayTruncatedAddress } from "../helpers";

import dropdownIcon from "../assets/dropdown-icon.svg";
import userAvatar from "../assets/avatar.png";
import circleLogomark from "../assets/circle-logomark.svg";
import settingsButton from "../assets/settings-button.svg";
import lockClosed from "../assets/lock-closed.svg";
import lightning from "../assets/lightning.svg";

interface TurnkeyHeaderProps {
  currentUser?: any | undefined;
  readWriteSession?: any | undefined;
  setReadWriteSession: Dispatch<SetStateAction<any | undefined>>;
  wallets?: any[];
  selectedWallet?: any;
  setSelectedWallet?: Dispatch<SetStateAction<any>>;
  walletAccounts?: any[];
  setWalletAccounts?: Dispatch<SetStateAction<any[]>>;
  selectedWalletAccount?: any;
  setSelectedWalletAccount?: Dispatch<SetStateAction<any>>;
  userDropdownOpen?: boolean;
  setUserDropdownOpen?: Dispatch<SetStateAction<boolean>>;
}

export const TurnkeyHeader: React.FC<TurnkeyHeaderProps> = ({
  currentUser = undefined,
  readWriteSession = undefined,
  setReadWriteSession = () => undefined,
  wallets = [],
  selectedWallet = undefined,
  setSelectedWallet = () => undefined,
  walletAccounts = [],
  setWalletAccounts = () => undefined,
  selectedWalletAccount = undefined,
  setSelectedWalletAccount = () => undefined,
  userDropdownOpen = false,
  setUserDropdownOpen = () => undefined,
}) => {
  const { turnkey, passkeyClient, authIframeClient, getActiveClient } =
    useTurnkey();
  const navigate = useNavigate();
  const { setFlashMessage } = useFlashMessage();

  const toggleUserDropdown = async () => {
    if (userDropdownOpen) {
      setUserDropdownOpen(false);
    } else {
      setUserDropdownOpen(true);
    }
  };

  const logoutUser = async () => {
    turnkey?.logoutUser();
    setFlashMessage({ message: "Successfully logged out", type: "success" });
    navigate("/");
  };

  const addAccount = async () => {
    const activeClient = await getActiveClient();
    const nextPathIndex = walletAccounts.length;
    const response = await activeClient?.createWalletAccounts({
      walletId: selectedWallet?.walletId,
      accounts: [
        {
          curve: "CURVE_SECP256K1",
          pathFormat: "PATH_FORMAT_BIP32",
          path: `m/44'/60'/${nextPathIndex}'/0/0`,
          addressFormat: "ADDRESS_FORMAT_ETHEREUM",
        },
      ],
    });

    if (response) {
      const address = response.addresses[0];
      const nextWalletAccount = { address: address };
      const nextWalletAccounts = walletAccounts.concat(nextWalletAccount);
      setWalletAccounts(nextWalletAccounts);
      setSelectedWalletAccount(nextWalletAccount);
    }
  };

  const createPasskeySession = async () => {
    const currentUser = await turnkey?.getCurrentUser();

    const readWriteSession = await passkeyClient?.createPasskeySession(
      currentUser?.userId!,
      authIframeClient?.iframePublicKey!,
      "900",
    );

    if (readWriteSession) {
      setReadWriteSession(readWriteSession);
    }
  };

  return (
    <div
      className={`turnkey-header ${currentUser && selectedWallet ? "" : "disabled"}`}
    >
      <Branding logomarkColor="white" onClick={() => navigate("/dashboard")} />
      <div className="flex-spacer" />
      {readWriteSession ? (
        <div className="signing-session-container" onClick={() => {}}>
          <img className="lightning" src={lightning} />
        </div>
      ) : (
        <div
          className="signing-session-container"
          onClick={createPasskeySession}
        >
          <img className="lock-closed" src={lockClosed} />
        </div>
      )}
      {currentUser ? (
        <>
          <div
            className="wallets-container dropdown-control"
            onClick={toggleUserDropdown}
          >
            <div className="wallet-label-container">
              <p className="wallet-label">AD</p>
            </div>
            <div className="wallet-content-container">
              <p className="wallet-name">{selectedWallet?.walletName}</p>
              <p className="wallet-account">
                {displayTruncatedAddress(selectedWalletAccount?.address)}
              </p>
            </div>
            <img className="dropdown-icon" src={dropdownIcon} />
          </div>
          <img
            className="settings-icon dropdown-control"
            src={settingsButton}
            onClick={toggleUserDropdown}
          />
        </>
      ) : (
        <></>
      )}
      {userDropdownOpen ? (
        <div className="user-dropdown-container">
          {currentUser ? (
            <>
              <img className="user-avatar" src={userAvatar} />
              <p className="user-email">{currentUser.username}</p>
              <div
                className="action-button secondary manage-settings"
                onClick={() => navigate("/settings")}
              >
                <p className="action-button-text">Manage Settings</p>
              </div>
              <hr />
              {wallets.length > 1 ? (
                <>
                  <div className="wallets-section">
                    <p className="change-wallet">Change Wallet</p>
                    <div className="wallets">
                      {wallets.map((wallet, index) => (
                        <div
                          className={`wallet ${wallet.walletId === selectedWallet.walletId ? "selected" : ""}`}
                          key={`wallet-${index}`}
                          onClick={() => setSelectedWallet(wallet)}
                        >
                          <img
                            className="turnkey-logomark"
                            src={circleLogomark}
                          />
                          <p className="wallet-name">{wallet.walletName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr />
                </>
              ) : null}
              <div className="accounts-section">
                <p className="change-account">Change Account</p>
                <div className="wallet-accounts">
                  {walletAccounts.map((walletAccount, index) => (
                    <div
                      className={`wallet-account ${walletAccount.address == selectedWalletAccount.address ? "selected" : ""}`}
                      key={`wallet-account-${index}`}
                      onClick={() => setSelectedWalletAccount(walletAccount)}
                    >
                      <img className="turnkey-logomark" src={circleLogomark} />
                      <p className="address">
                        {displayTruncatedAddress(walletAccount.address)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-spacer" />
              <div className="action-buttons">
                <div className="action-button primary" onClick={addAccount}>
                  <p className="action-button-text">+ Add Account</p>
                </div>
                <div className="action-button primary" onClick={logoutUser}>
                  <p className="action-button-text">Logout</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p>THERE IS NO CURRENT USER</p>
            </>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
