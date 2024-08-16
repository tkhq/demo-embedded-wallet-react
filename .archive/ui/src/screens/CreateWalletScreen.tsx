import { Branding } from "../components/Branding";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTurnkey } from "@turnkey/sdk-react";
import { DEFAULT_ETHEREUM_ACCOUNTS } from "@turnkey/sdk-browser";
import { useFlashMessage } from "../hooks/useFlashMessage";

type WalletOption = "new" | "import";

export const CreateWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setFlashMessage } = useFlashMessage();
  const { turnkey, getActiveClient } = useTurnkey();
  const [selectedOption, setSelectedOption] = useState<WalletOption>("new");

  const handleOptionChange = (option: WalletOption) => {
    setSelectedOption(option);
  };

  const onContinue = async () => {
    try {
      if (selectedOption === "new") {
        const currentUserSession = await turnkey?.currentUserSession();
        const activeClient = await getActiveClient();
        const walletsResponse = await currentUserSession?.getWallets();
        const nextWalletsIndex = walletsResponse
          ? walletsResponse.wallets.length + 1
          : 1;
        const createWalletResponse = await activeClient?.createWallet({
          walletName: `Default Wallet ${nextWalletsIndex}`,
          accounts: DEFAULT_ETHEREUM_ACCOUNTS,
        });
        if (createWalletResponse) {
          navigate("/dashboard");
        }
      } else if (selectedOption === "import") {
        navigate("/import");
      }
    } catch (error) {
      setFlashMessage({ message: `${error}`, type: "error" });
    }
  };

  return (
    <div className="screen create-wallet-screen">
      <div className="container-window">
        <Branding />
        <p className="title">Account Setup</p>
        <div className="wallet-options">
          <div
            className={`selection-option-container wallet-option new ${selectedOption === "new" ? "selected" : ""}`}
            onClick={() => handleOptionChange("new")}
          >
            <div
              className={`selection-option ${selectedOption === "new" ? "selected" : ""}`}
            >
              <div
                className={`selection-option-interior ${selectedOption === "new" ? "selected" : ""}`}
              />
            </div>
            <p>Create new wallet</p>
          </div>
          <div
            className={`selection-option-container wallet-option import ${selectedOption === "import" ? "selected" : ""}`}
            onClick={() => handleOptionChange("import")}
          >
            <div
              className={`selection-option ${selectedOption === "import" ? "selected" : ""}`}
            >
              <div
                className={`selection-option-interior ${selectedOption === "import" ? "selected" : ""}`}
              />
            </div>
            <p>Import existing wallet</p>
          </div>
        </div>
        <div className="action-buttons">
          <div className="action-button primary" onClick={onContinue}>
            <p className="action-button-text">Continue</p>
          </div>
          <div
            className="action-button quaternary"
            onClick={() => navigate(-1)}
          >
            <p className="action-button-text">Cancel</p>
          </div>
        </div>
      </div>
    </div>
  );
};
