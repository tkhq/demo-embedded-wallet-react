import React, { useState, useEffect, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { useFlashMessage } from "../../hooks/useFlashMessage";
import { ModalType } from "../../types/modal";
import { useTurnkey } from "@turnkey/sdk-react";
import {
  TurnkeyIframeClient,
  DEFAULT_ETHEREUM_ACCOUNTS,
  TurnkeySDKApiTypes,
} from "@turnkey/sdk-browser";

import infoIcon from "../../assets/info.svg";

type ImportOption = "wallet" | "private-key";

export const ImportModal: React.FC<{}> = ({}) => {
  const { setActiveModal } = useModal();
  const { setFlashMessage } = useFlashMessage();
  const { turnkey, getActiveClient } = useTurnkey();
  const [iframeClient, setIframeClient] = useState<
    TurnkeyIframeClient | undefined
  >(undefined);
  const [iframeStyle, setIframeStyle] = useState<Record<any, any>>({
    display: "none",
  });
  const iframeInit = useRef<boolean>(false);

  const [initImportWalletComplete, setInitImportWalletComplete] =
    useState<boolean>(false);
  const [initImportPrivateKeyComplete, setInitImportPrivateKeyComplete] =
    useState<boolean>(false);

  const [newWalletName, setNewWalletName] = useState<string>("");
  const [newPrivateKeyName, setNewPrivateKeyName] = useState<string>("");

  const TurnkeyImportIframeContainerId = "turnkey-import-iframe-container-id";

  const [selectedOption, setSelectedOption] = useState<ImportOption>("wallet");

  const TurnkeyExportIframeContainerId = "turnkey-import-iframe-container-id";

  useEffect(() => {
    if (initImportWalletComplete || initImportPrivateKeyComplete) {
      setIframeStyle({
        display: "block",
        width: "100%",
        boxSizing: "border-box",
      });
    }
  }, [initImportWalletComplete, initImportPrivateKeyComplete]);

  useEffect(() => {
    (async () => {
      if (!iframeInit.current) {
        iframeInit.current = true;

        const newImportIframeClient = await turnkey?.iframeClient({
          iframeContainer: document.getElementById(
            TurnkeyImportIframeContainerId,
          ),
          iframeUrl:
            process.env.REACT_APP_IMPORT_IFRAME_URL ??
            "https://import.turnkey.com",
        });
        setIframeClient(newImportIframeClient);
      }
    })();
  }, []);

  const closeModalIfElementClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      setActiveModal(ModalType.None);
    }
  };

  const handleOptionChange = (option: ImportOption) => {
    setSelectedOption(option);
  };

  const initImportWallet = async () => {
    const currentUser = await turnkey?.getCurrentUser();
    const activeClient = await getActiveClient();

    const initImportResponse = await activeClient?.initImportWallet({
      userId: `${currentUser?.userId}`,
    });

    if (initImportResponse?.importBundle) {
      const injectResponse = await iframeClient?.injectImportBundle(
        initImportResponse.importBundle,
        `${currentUser?.organization.organizationId}`,
        `${currentUser?.userId}`,
      );

      if (injectResponse) {
        setInitImportWalletComplete(true);
      }
    }
  };

  const importWallet = async () => {
    try {
      const currentUser = await turnkey?.getCurrentUser();
      const activeClient = await getActiveClient();
      const encryptedBundle =
        await iframeClient?.extractWalletEncryptedBundle();

      if (encryptedBundle) {
        // Perform very basic validation; ideally do this via form validation
        if (!newWalletName) {
          alert("Wallet name required");
          return;
        }

        const importResponse = await activeClient?.importWallet({
          userId: `${currentUser?.userId}`,
          walletName: newWalletName,
          encryptedBundle,
          accounts: DEFAULT_ETHEREUM_ACCOUNTS,
        });

        if (importResponse) {
          setFlashMessage({
            message: "Successfully Imported Wallet",
            type: "success",
          });
          setActiveModal(ModalType.None);
        }
      }
    } catch (error) {
      setFlashMessage({ message: `${error}`, type: "error" });
      setActiveModal(ModalType.None);
    }
  };

  const initImportPrivateKey = async () => {
    const currentUser = await turnkey?.getCurrentUser();
    const activeClient = await getActiveClient();

    const initImportResponse = await activeClient?.initImportPrivateKey({
      userId: `${currentUser?.userId}`,
    });

    if (initImportResponse?.importBundle) {
      const injectResponse = await iframeClient?.injectImportBundle(
        initImportResponse.importBundle,
        `${currentUser?.organization.organizationId}`,
        `${currentUser?.userId}`,
      );

      if (injectResponse) {
        setInitImportPrivateKeyComplete(true);
      }
    }
  };

  const importPrivateKey = async () => {
    const currentUser = await turnkey?.getCurrentUser();
    const activeClient = await getActiveClient();

    const encryptedBundle = await iframeClient?.extractKeyEncryptedBundle();

    if (encryptedBundle) {
      // Perform very basic validation; ideally do this via form validation
      if (!newPrivateKeyName) {
        alert("Private key name required");
        return;
      }

      const importResponse = await activeClient?.importPrivateKey({
        userId: `${currentUser?.userId}`,
        privateKeyName: newPrivateKeyName,
        encryptedBundle: encryptedBundle,
        curve: "CURVE_SECP256K1",
        addressFormats: ["ADDRESS_FORMAT_ETHEREUM"],
      });

      if (importResponse) {
        setFlashMessage({
          message: "Successfully Imported Private Key",
          type: "success",
        });
        setActiveModal(ModalType.None);
      }
    }
  };

  return (
    <div className="Modal import" onClick={closeModalIfElementClick}>
      <div className="modal-content">
        <div className="modal-title-container">
          {initImportWalletComplete ? (
            <>
              <p className="modal-title">Enter your Seed Phrase</p>
            </>
          ) : null}
          {initImportPrivateKeyComplete ? (
            <>
              <p className="modal-title">Enter your Private Key</p>
            </>
          ) : null}
          {!initImportWalletComplete && !initImportPrivateKeyComplete ? (
            <>
              <p className="modal-title">Import Wallet</p>
            </>
          ) : null}
        </div>

        <div className="modal-body">
          {!initImportWalletComplete && !initImportPrivateKeyComplete ? (
            <>
              <div className="import-options">
                <div
                  className={`selection-option-container import-option wallet ${selectedOption === "wallet" ? "selected" : ""}`}
                  onClick={() => handleOptionChange("wallet")}
                >
                  <div
                    className={`selection-option ${selectedOption === "wallet" ? "selected" : ""}`}
                  >
                    <div
                      className={`selection-option-interior ${selectedOption === "wallet" ? "selected" : ""}`}
                    />
                  </div>
                  <p>Seed phrase</p>
                </div>
                <div
                  className={`selection-option-container import-option private-key ${selectedOption === "private-key" ? "selected" : ""}`}
                  onClick={() => handleOptionChange("private-key")}
                >
                  <div
                    className={`selection-option ${selectedOption === "private-key" ? "selected" : ""}`}
                  >
                    <div
                      className={`selection-option-interior ${selectedOption === "private-key" ? "selected" : ""}`}
                    />
                  </div>
                  <p>Raw private key</p>
                </div>
              </div>
              <div className="action-buttons">
                <div
                  className={`action-button primary`}
                  onClick={() => {
                    selectedOption === "wallet"
                      ? initImportWallet()
                      : initImportPrivateKey();
                  }}
                >
                  <p className="action-button-text">Continue</p>
                </div>
                <div
                  className={`action-button quaternary`}
                  onClick={() => setActiveModal(ModalType.None)}
                >
                  <p className="action-button-text">Cancel</p>
                </div>
              </div>
            </>
          ) : null}

          <div
            id={TurnkeyExportIframeContainerId}
            className="iframe-container"
            style={iframeStyle}
          />

          {initImportWalletComplete ? (
            <>
              <div className="iframe-subscript-container">
                <img src={infoIcon} className="info-icon" />
                <p className="iframe-subscript">
                  Seed phrases are typically 12-24 words
                </p>
              </div>
              <div className="wallet-name-section">
                <p className="label">Wallet Name</p>
                <input
                  type="text"
                  placeholder="Example Wallet"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                />
              </div>
              <div className="action-buttons" onClick={importWallet}>
                <div className="action-button primary">
                  <p className="action-button-text">Continue</p>
                </div>
              </div>
            </>
          ) : null}

          {initImportPrivateKeyComplete ? (
            <>
              <div className="iframe-subscript-container">
                <img src={infoIcon} className="info-icon" />
                <p className="iframe-subscript">
                  A private key is an alphanumeric string
                </p>
              </div>
              <div className="private-key-name-section">
                <p className="label">Private Key Name</p>
                <input
                  type="text"
                  placeholder="Example Private Key"
                  value={newPrivateKeyName}
                  onChange={(e) => setNewPrivateKeyName(e.target.value)}
                />
              </div>
              <div className="action-buttons" onClick={importPrivateKey}>
                <div className="action-button primary">
                  <p className="action-button-text">Continue</p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
