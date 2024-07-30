import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../hooks/useModal";
import { ModalType } from "../../types/modal";
import { useTurnkey } from "@turnkey/sdk-react";
import { TurnkeySigner } from "@turnkey/ethers";
import { InfuraProvider } from "../../services/InfuraService";
import { ethers } from "ethers";
import { useFlashMessage } from "../../hooks/useFlashMessage";
import { isValidEthereumAddress, displayTruncatedAddress } from "../../helpers";

import ethereumIcon from "../../assets/eth.svg";

const tkhqFaucetAddress = "0xE7F48E6dCfBeA43ff5CD1F1570f6543878cCF156";

interface SendInitialModalProps {
  ethereumPrice: number;
  walletAccount: any;
}

export const SendInitialModal: React.FC<SendInitialModalProps> = ({
  ethereumPrice = 0,
  walletAccount = undefined,
}) => {
  const { setActiveModal } = useModal();
  const [amountToSend, setAmountToSend] = useState<string>("0");
  const [destinationAddress, setDestinationAddress] = useState<string>(tkhqFaucetAddress);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const closeModalIfElementClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      setActiveModal(ModalType.None);
    }
  };

  const validateSend = () => {
    const nextValidationErrors: Record<string, string> = {};
    if (Number(amountToSend) <= 0) {
      nextValidationErrors["amountToSend"] = "must be greater than 0";
    }
    if (!isValidEthereumAddress(destinationAddress)) {
      nextValidationErrors["destinationAddress"] =
        "must be a valid Ethereum address";
    }
    if (Object.keys(nextValidationErrors).length === 0) {
      setValidationErrors(nextValidationErrors);
      setActiveModal(ModalType.SendReview, {
        ethereumPrice: ethereumPrice,
        walletAccount: walletAccount,
        amountToSend: amountToSend,
        destinationAddress: destinationAddress,
      });
    } else {
      setValidationErrors(nextValidationErrors);
    }
  };

  return (
    <div className="Modal send-initial" onClick={closeModalIfElementClick}>
      <div className="modal-content">
        <div className="modal-title-container">
          <p className="modal-title">Send</p>
          <p className="modal-subtitle">
            Select the asset type, and enter the amount and destination address
            you'd like to send from your <span>Turnkey Wallet</span>. Need testnet funds? Click “Get Funds” on the homepage. The default destination is Turnkey's Faucet address.
          </p>
        </div>

        <div className="modal-body">
          <div className="asset-select-section">
            <p className="label">Asset</p>
            <div className="asset-row">
              <img className="asset-icon" src={ethereumIcon} />
              <p className="asset-name">Ethereum</p>
            </div>
          </div>

          <div className="amount-input-section">
            <p className="label">Amount (ETH)</p>
            <input
              className={`${validationErrors.amountToSend ? "validation-error" : ""}`}
              type="text"
              placeholder="0"
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value || "0")}
            />
            <p className="sublabel">{`Approximately $${(Number(amountToSend) * ethereumPrice).toFixed(2)} USD`}</p>
          </div>

          <div className="destination-address-section">
            <p className="label">Destination address</p>
            <input
              className={`${validationErrors.destinationAddress ? "validation-error" : ""}`}
              type="text"
              placeholder={tkhqFaucetAddress}
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
            />
            {validationErrors.destinationAddress ? (
              <p className="sublabel validation-error">
                {validationErrors.destinationAddress}
              </p>
            ) : null}
          </div>

          <div className="action-buttons">
            <div className="action-button primary" onClick={validateSend}>
              <p>Next</p>
            </div>

            <div
              className="action-button quaternary"
              onClick={() => setActiveModal(ModalType.None)}
            >
              <p>Cancel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SendReviewModalProps {
  ethereumPrice: number;
  walletAccount: any;
  amountToSend: string;
  destinationAddress: string;
}

export const SendReviewModal: React.FC<SendReviewModalProps> = ({
  ethereumPrice = 0,
  walletAccount = undefined,
  amountToSend = "0",
  destinationAddress = "",
}) => {
  const { turnkey, getActiveClient } = useTurnkey();
  const { setActiveModal } = useModal();
  const { setFlashMessage } = useFlashMessage();
  const navigate = useNavigate();

  const closeModalIfElementClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      setActiveModal(ModalType.None);
    }
  };

  const sendTransaction = async () => {
    try {
      const activeClient = await getActiveClient();
      const currentUser = await turnkey?.getCurrentUser();

      const turnkeySigner = new TurnkeySigner({
        client: activeClient!,
        organizationId: `${currentUser?.organization.organizationId}`,
        signWith: `${walletAccount?.address}`,
      });

      const connectedSigner = turnkeySigner.connect(InfuraProvider);

      const transactionRequest = {
        to: destinationAddress,
        value: ethers.parseEther(amountToSend),
        type: 2,
      };

      const sentTransaction =
        await connectedSigner.sendTransaction(transactionRequest);

      if (sentTransaction) {
        setFlashMessage({
          message: `Successfully sent ${amountToSend} ETH`,
          type: "success",
        });
        setActiveModal(ModalType.None);
        navigate("/dashboard");
      }
    } catch (error) {
      setFlashMessage({ message: `${error}`, type: "error" });
    }
  };

  return (
    <div className="Modal send-review" onClick={closeModalIfElementClick}>
      <div className="modal-content">
        <div className="modal-title-container">
          <p className="modal-title">You're Sending</p>
          <p className="amount-to-send">{`${amountToSend} ETH`}</p>
          <p className="amount-in-usd">{`$${(Number(amountToSend) * ethereumPrice).toFixed(2)} USD`}</p>
        </div>

        <div className="modal-body">
          <div className="from-section">
            <p className="section-label">From</p>
            <p className="section-label">Turnkey Wallet</p>
            <p className="section-sublabel address">
              {displayTruncatedAddress(walletAccount.address)}
            </p>
          </div>

          <div className="divider" />

          <div className="to-section">
            <p className="section-label">To</p>
            <p className="section-sublabel address">
              {displayTruncatedAddress(destinationAddress)}
            </p>
          </div>

          <div className="divider" />

          <div className="network-section">
            <p className="section-label">Network</p>
            <p className="section-sublabel big">Sepolia ETH</p>
          </div>

          <div className="divider" />

          <div className="network-fee-section">
            <p className="section-label">Network fee</p>
            <div className="flex-spacer" />
            <div className="network-fee-container">
              <p className="section-sublabel big">$0.30</p>
              <p className="section-sublabel big">0.00000000001 ETH</p>
            </div>
          </div>

          <div className="total-section">
            <p className="section-label">Total</p>
            <div className="flex-spacer" />
            <p className="section-sublabel big">{`${amountToSend} ETH`}</p>
          </div>

          <div className="action-buttons">
            <div onClick={sendTransaction} className="action-button primary">
              <p>{`Send ${amountToSend} ETH now`}</p>
            </div>

            <div
              className="action-button quaternary"
              onClick={() =>
                setActiveModal(ModalType.SendInitial, {
                  walletAccount: walletAccount,
                })
              }
            >
              <p>Cancel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
