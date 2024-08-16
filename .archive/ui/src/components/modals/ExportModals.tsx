import React, { useState, useRef, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { ModalType } from "../../types/modal";
import type { TurnkeyIframeClient } from "@turnkey/sdk-browser";
import { useTurnkey } from "@turnkey/sdk-react";
import { useFlashMessage } from "../../hooks/useFlashMessage";

interface RevealSeedPhraseDisclaimerModalProps {
  currentUser: any;
  selectedWallet: any;
  selectedWalletAccount: any;
}

export const RevealSeedPhraseDisclaimerModal: React.FC<
  RevealSeedPhraseDisclaimerModalProps
> = ({
  currentUser = undefined,
  selectedWallet = undefined,
  selectedWalletAccount = undefined,
}) => {
  const { setActiveModal } = useModal();

  const closeModalIfElementClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      setActiveModal(ModalType.None);
    }
  };

  return (
    <div
      className="Modal reveal-seed-phrase-disclaimer"
      onClick={closeModalIfElementClick}
    >
      <div className="modal-content">
        <div className="modal-title-container">
          <p className="modal-title">Reveal seed phrase</p>
          <p className="modal-subtitle">
            By revealing the private seed phrase for your{" "}
            <span className="underline">Turnkey Wallet</span>, you agree that:
          </p>
        </div>
        <div className="modal-body">
          <ul>
            <li>You should never share your seed phrase with anyone.</li>
            <li>
              You are responsible for the security of this seed phrase, and any
              assets associated with it. Turnkey cannot help you recover the
              seed phrase on your behalf.
            </li>
            <li>
              Failure to properly secure your private key may result in loss of
              associated assets.
            </li>
            <li>
              Turnkey is not responsible for any other wallet you may use with
              this seed phrase.
            </li>
            <li>
              You have read and agree to Turnkey's Terms of Service, including
              the risks related to exporting your seed phrase disclosed therein.
            </li>
          </ul>
          <div className="action-buttons">
            <div
              className="action-button primary"
              onClick={() =>
                setActiveModal(ModalType.SelectExportType, {
                  currentUser,
                  selectedWallet,
                  selectedWalletAccount,
                })
              }
            >
              <p className="action-button-text">Continue</p>
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

interface SelectExportTypeModalProps {
  currentUser: any;
  selectedWallet: any;
  selectedWalletAccount: any;
}

type ExportOption = "seed-phrase" | "private-key";

export const SelectExportTypeModal: React.FC<SelectExportTypeModalProps> = ({
  currentUser = undefined,
  selectedWallet = undefined,
  selectedWalletAccount = undefined,
}) => {
  const { setActiveModal } = useModal();
  const [selectedOption, setSelectedOption] =
    useState<ExportOption>("seed-phrase");

  const closeModalIfElementClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      setActiveModal(ModalType.None);
    }
  };

  const handleOptionChange = (option: ExportOption) => {
    setSelectedOption(option);
  };

  return (
    <div
      className="Modal select-export-type"
      onClick={closeModalIfElementClick}
    >
      <div className="modal-content">
        <div className="modal-title-container">
          <p className="modal-title">Select Export Type</p>
        </div>
        <div className="modal-body">
          <div className="export-options">
            <div
              className={`selection-option-container export-option seed-phrase ${selectedOption === "seed-phrase" ? "selected" : ""}`}
              onClick={() => handleOptionChange("seed-phrase")}
            >
              <div
                className={`selection-option ${selectedOption === "seed-phrase" ? "selected" : ""}`}
              >
                <div
                  className={`selection-option-interior ${selectedOption === "seed-phrase" ? "selected" : ""}`}
                />
              </div>
              <p>Seed phrase</p>
            </div>
            <div
              className={`selection-option-container export-option private-key ${selectedOption === "private-key" ? "selected" : ""}`}
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
              className="action-button primary"
              onClick={() => {
                if (selectedOption === "seed-phrase") {
                  setActiveModal(ModalType.WalletSeedPhrase, {
                    currentUser,
                    selectedWallet,
                  });
                }
                if (selectedOption === "private-key") {
                  setActiveModal(ModalType.WalletAccountPrivateKey, {
                    currentUser,
                    selectedWalletAccount,
                  });
                }
              }}
            >
              <p className="action-button-text">Continue</p>
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

interface WalletSeedPhraseModalProps {
  currentUser: any;
  selectedWallet: any;
}

export const WalletSeedPhraseModal: React.FC<WalletSeedPhraseModalProps> = ({
  currentUser = undefined,
  selectedWallet = undefined,
}) => {
  const { setActiveModal } = useModal();
  const { turnkey, getActiveClient } = useTurnkey();
  const { setFlashMessage } = useFlashMessage();
  const [iframeClient, setIframeClient] = useState<
    TurnkeyIframeClient | undefined
  >(undefined);
  const [iframeStyle, setIframeStyle] = useState<Record<any, any>>({
    display: "none",
  });
  const [bundleInjected, setBundleInjected] = useState<boolean>(false);
  const iframeInit = useRef<boolean>(false);

  const TurnkeyExportIframeContainerId = "turnkey-export-iframe-container-id";

  const closeModalIfElementClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      setActiveModal(ModalType.None);
    }
  };

  useEffect(() => {
    (async () => {
      if (!iframeInit.current) {
        iframeInit.current = true;

        const newExportIframeClient = await turnkey?.iframeClient({
          iframeContainer: document.getElementById(
            TurnkeyExportIframeContainerId,
          ),
          iframeUrl:
            process.env.REACT_APP_EXPORT_IFRAME_URL ??
            "https://export.turnkey.com",
        });
        setIframeClient(newExportIframeClient);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (iframeClient) {
        try {
          const activeClient = await getActiveClient();
          const exportResponse = await activeClient?.exportWallet({
            walletId: selectedWallet.walletId,
            targetPublicKey: `${iframeClient?.iframePublicKey}`,
          });
          if (exportResponse?.exportBundle) {
            const injectResponse = await iframeClient?.injectWalletExportBundle(
              exportResponse.exportBundle,
              `${currentUser?.organization.organizationId}`,
            );
            if (injectResponse) {
              setIframeStyle({
                display: "block",
                width: "100%",
                boxSizing: "border-box",
              });
              setBundleInjected(true);
            }
          }
        } catch (error) {
          setFlashMessage({ message: `${error}`, type: "error" });
        }
      }
    })();
  }, [iframeClient]);

  return (
    <div
      className="Modal wallet-seed-phrase"
      onClick={closeModalIfElementClick}
    >
      <div className={`modal-content ${bundleInjected ? "" : "hidden"}`}>
        <div className="modal-title-container">
          <p className="modal-title">Turnkey Wallet Seed Phrase</p>
        </div>
        <div className="modal-body">
          <div
            id={TurnkeyExportIframeContainerId}
            className="iframe-container"
            style={iframeStyle}
          />
          <div className="action-buttons">
            <div
              className="action-button quaternary"
              onClick={() => setActiveModal(ModalType.None)}
            >
              <p className="action-button-text">Done</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface WalletAccountPrivateKeyModalProps {
  currentUser: any;
  selectedWalletAccount: any;
}

export const WalletAccountPrivateKeyModal: React.FC<
  WalletAccountPrivateKeyModalProps
> = ({ currentUser = undefined, selectedWalletAccount = undefined }) => {
  const { setActiveModal } = useModal();
  const { turnkey, getActiveClient } = useTurnkey();
  const { setFlashMessage } = useFlashMessage();
  const [iframeClient, setIframeClient] = useState<
    TurnkeyIframeClient | undefined
  >(undefined);
  const [iframeStyle, setIframeStyle] = useState<Record<any, any>>({
    display: "none",
  });
  const [bundleInjected, setBundleInjected] = useState<boolean>(false);
  const iframeInit = useRef<boolean>(false);

  const TurnkeyExportIframeContainerId = "turnkey-export-iframe-container-id";

  const closeModalIfElementClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      setActiveModal(ModalType.None);
    }
  };

  useEffect(() => {
    (async () => {
      if (!iframeInit.current) {
        iframeInit.current = true;

        const newExportIframeClient = await turnkey?.iframeClient({
          iframeContainer: document.getElementById(
            TurnkeyExportIframeContainerId,
          ),
          iframeUrl:
            process.env.REACT_APP_EXPORT_IFRAME_URL ??
            "https://export.turnkey.com",
        });
        setIframeClient(newExportIframeClient);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (iframeClient) {
        try {
          const activeClient = await getActiveClient();
          const exportResponse = await activeClient?.exportWalletAccount({
            address: selectedWalletAccount.address,
            targetPublicKey: `${iframeClient?.iframePublicKey}`,
          });
          if (exportResponse?.exportBundle) {
            const injectResponse = await iframeClient?.injectKeyExportBundle(
              exportResponse.exportBundle,
              `${currentUser?.organization.organizationId}`,
            );
            if (injectResponse) {
              setIframeStyle({
                display: "block",
                width: "100%",
                boxSizing: "border-box",
              });
              setBundleInjected(true);
            }
          }
        } catch (error) {
          setFlashMessage({ message: `${error}`, type: "error" });
        }
      }
    })();
  }, [iframeClient]);

  return (
    <div
      className="Modal wallet-account-private-key"
      onClick={closeModalIfElementClick}
    >
      <div className={`modal-content ${bundleInjected ? "" : "hidden"}`}>
        <div className="modal-title-container">
          <p className="modal-title">Wallet Account Private Key</p>
          <p className="modal-subtitle">{`address: ${selectedWalletAccount.address}`}</p>
        </div>
        <div className="modal-body">
          <div
            id={TurnkeyExportIframeContainerId}
            className="iframe-container"
            style={iframeStyle}
          />
          <div className="action-buttons">
            <div
              className="action-button quaternary"
              onClick={() => setActiveModal(ModalType.None)}
            >
              <p className="action-button-text">Done</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
