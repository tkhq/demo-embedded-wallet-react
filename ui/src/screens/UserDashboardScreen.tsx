import { useState, useEffect } from "react";
import {
  DEFAULT_ETHEREUM_ACCOUNTS,
  type TurnkeySDKApiTypes,
} from "@turnkey/sdk-browser";
import { useTurnkey } from "@turnkey/sdk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useModal } from "../hooks/useModal";
import { ModalType } from "../types/modal";
import { alchemy } from "../services/AlchemyService";
import { AssetTransfersCategory } from "alchemy-sdk";
import { useFlashMessage } from "../hooks/useFlashMessage";
import { displayTruncatedAddress, getOrdinalSuffix } from "../helpers";
import { ethers } from "ethers";

import arrowUp from "../assets/arrow-up.svg";
import arrowUpBackground from "../assets/arrow-up-background.svg";
import arrowDown from "../assets/arrow-down.svg";
import arrowDownBackground from "../assets/arrow-down-background.svg";
import copyIcon from "../assets/copy-icon.svg";
import ethereumLogo from "../assets/eth.svg";
import { Spinner } from "../components/Spinner";
import { InfuraProvider } from "../services/InfuraService";

const WEI = 1_000_000_000_000_000_000;

interface UserDashboardProps {
  ethereumPrice: number;
  currentUser: any;
  selectedWallet: any;
  selectedWalletAccount: any;
}

export const UserDashboardScreen: React.FC<UserDashboardProps> = ({
  ethereumPrice = 0,
  currentUser = undefined,
  selectedWallet = undefined,
  selectedWalletAccount = undefined,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { turnkey, passkeyClient } = useTurnkey();
  const { setFlashMessage } = useFlashMessage();
  const { setActiveModal } = useModal();

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const [
    selectedWalletAccountNativeBalance,
    setSelectedWalletAccountNativeBalance,
  ] = useState<number>(0);
  const [
    selectedWalletAccountTokenBalances,
    setSelectedWalletAccountTokenBalances,
  ] = useState<any[]>([]);
  const [
    selectedWalletAccountInboundTransactions,
    setSelectedWalletAccountInboundTransactions,
  ] = useState<any[]>([]);
  const [
    selectedWalletAccountOutboundTransactions,
    setSelectedWalletAccountOutboundTransactions,
  ] = useState<any[]>([]);

  const confirmInboundTransactionHash = async (
    targetTransactionHash: string,
  ): Promise<boolean> => {
    const inboundResponse = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toAddress: selectedWalletAccount.address,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155,
      ],
      withMetadata: true,
    });
    return inboundResponse.transfers.some(
      (transfer) => transfer.hash === targetTransactionHash,
    );
  };

  const confirmOutboundTransactionHash = async (
    targetTransactionHash: string,
  ): Promise<boolean> => {
    const outboundResponse = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      fromAddress: selectedWalletAccount.address,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155,
      ],
      withMetadata: true,
    });
    return outboundResponse.transfers.some(
      (transfer) => transfer.hash === targetTransactionHash,
    );
  };

  const updateWalletBalances = async () => {
    const nativeResponse = await alchemy.core.getBalance(
      selectedWalletAccount.address,
    );
    const tokenResponse = await alchemy.core.getTokenBalances(
      selectedWalletAccount.address,
    );
    const inboundResponse = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toAddress: selectedWalletAccount.address,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155,
      ],
      withMetadata: true,
    });
    const outboundResponse = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      fromAddress: selectedWalletAccount.address,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155,
      ],
      withMetadata: true,
    });
    if (nativeResponse && tokenResponse) {
      setSelectedWalletAccountNativeBalance(Number(nativeResponse));
      setSelectedWalletAccountTokenBalances(tokenResponse.tokenBalances);
    }
    if (inboundResponse && outboundResponse) {
      setSelectedWalletAccountInboundTransactions(inboundResponse.transfers);
      setSelectedWalletAccountOutboundTransactions(outboundResponse.transfers);
    }
  };

  useEffect(() => {
    (async () => {
      if (selectedWalletAccount?.address) {
        setIsLoadingData(true);
        await updateWalletBalances();
        setIsLoadingData(false);
      }
    })();
  }, [selectedWalletAccount]);

  const receiveAirdrop = async () => {
    const privateKey =
      "4b48b9be7ec201bf165e90e89f451bf13ac8b569fd86d0c17977d67dc3642b35";
    const airdropAmount = "0.005";

    const airdropWallet = new ethers.Wallet(privateKey);
    const connectedAirdropWallet = airdropWallet.connect(InfuraProvider);

    const txData = {
      to: selectedWalletAccount.address,
      value: ethers.parseEther(airdropAmount),
      type: 2,
    };

    const sentTransaction =
      await connectedAirdropWallet.sendTransaction(txData);

    if (sentTransaction) {
      setFlashMessage({
        message: `Waiting for transaction confirmation...`,
        type: "pending",
      });
      const pollInterval = 2000;
      const timeout = Date.now() + 60000000;

      const poller = setInterval(async () => {
        const hashConfirmed = await confirmInboundTransactionHash(
          sentTransaction.hash,
        );
        if (hashConfirmed) {
          clearInterval(poller);
          await updateWalletBalances();
          setFlashMessage({
            message: `Successfully airdropped ${airdropAmount} ETH`,
            type: "success",
          });
        }
        if (Date.now() > timeout) {
          clearInterval(poller);
        }
      }, pollInterval);
    }
  };

  return (
    <div className="screen user-dashboard-screen">
      {isLoadingData ? (
        <Spinner spinnerType="Chase" />
      ) : (
        <>
          <div className="header-section">
            <div className="wallet-info-section">
              <div className="wallets">
                <p className="wallet-name">{selectedWallet?.walletName}</p>
                <p className="account-address">
                  {displayTruncatedAddress(selectedWalletAccount?.address)}
                </p>
                <img
                  onClick={() => {
                    navigator.clipboard.writeText(
                      selectedWalletAccount?.address,
                    );
                    setFlashMessage({
                      message: "Copied wallet address",
                      type: "success",
                    });
                  }}
                  className="copy-icon"
                  src={copyIcon}
                />
              </div>

              <div className="balances">
                <div className="usd-balance">
                  <p className="usd-balance-text">{`$${((selectedWalletAccountNativeBalance / WEI) * ethereumPrice).toFixed(2)}`}</p>
                  <p className="usd-balance-label">{"USD"}</p>
                </div>

                <div className="native-balance">
                  <p className="native-balance-text">{`${parseFloat((selectedWalletAccountNativeBalance / WEI).toFixed(5))}`}</p>
                  <p className="native-balance-label">{"ETH"}</p>
                </div>
              </div>
            </div>
            <div className="flex-spacer" />
            <div className="action-buttons">
              <div className="action-button primary" onClick={receiveAirdrop}>
                <p className="action-button-text">Get Funds</p>
              </div>
              <div
                className="action-button secondary"
                onClick={() =>
                  setActiveModal(ModalType.SendInitial, {
                    ethereumPrice,
                    walletAccount: selectedWalletAccount,
                  })
                }
              >
                <img className="action-button-icon" src={arrowUp} />
                <p className="action-button-text">Send</p>
              </div>
              <div
                className="action-button secondary"
                onClick={() =>
                  setActiveModal(ModalType.Receive, {
                    walletAccount: selectedWalletAccount,
                  })
                }
              >
                <img className="action-button-icon" src={arrowDown} />
                <p className="action-button-text">Receive</p>
              </div>
              <div
                className="action-button quaternary"
                onClick={() => setActiveModal(ModalType.Import)}
              >
                <p className="action-button-text">Import</p>
              </div>
              <div
                className="action-button quaternary"
                onClick={() =>
                  setActiveModal(ModalType.SelectExportType, {
                    currentUser,
                    selectedWallet,
                    selectedWalletAccount,
                  })
                }
              >
                <p className="action-button-text">Export</p>
              </div>
            </div>
          </div>

          <p className="my-assets">My assets</p>

          <table className="assets-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Value (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ethereum-cell">
                  <img src={ethereumLogo} />
                  <p>Ethereum (Sepolia)</p>
                </td>
                <td className="address-cell">
                  {selectedWalletAccount.address}
                </td>
                <td className="eth-amount">
                  {(selectedWalletAccountNativeBalance / WEI)
                    .toFixed(5)
                    .replace(/(\.\d*?[1-9])0+$/g, "$1")
                    .replace(/\.0+$/, "")}
                </td>
                <td className="usd-price">{`$${((selectedWalletAccountNativeBalance / WEI) * ethereumPrice).toFixed(2)}`}</td>
              </tr>
            </tbody>
          </table>

          <div className="assets-table-mobile">
            <div className="assets-container">
              <img className="ethereum-logo" src={ethereumLogo} />
              <div className="address-container">
                <p className="asset-name">Ethereum (Testnet)</p>
                <p className="address">
                  {displayTruncatedAddress(selectedWalletAccount.address)}
                </p>
              </div>
              <div className="flex-spacer" />
              <div className="value-container">
                <p className="eth-amount">{`${(
                  selectedWalletAccountNativeBalance / WEI
                )
                  .toFixed(5)
                  .replace(/(\.\d*?[1-9])0+$/g, "$1")
                  .replace(/\.0+$/, "")} ETH`}</p>
                <p className="usd-price">{`$${((selectedWalletAccountNativeBalance / WEI) * ethereumPrice).toFixed(2)} USD`}</p>
              </div>
            </div>
            <div className="action-buttons">
              <div
                className="action-button quaternary"
                onClick={() =>
                  setActiveModal(ModalType.SendInitial, {
                    ethereumPrice,
                    walletAccount: selectedWalletAccount,
                  })
                }
              >
                <p className="action-button-text">Send</p>
              </div>
              <div
                className="action-button quaternary"
                onClick={() =>
                  setActiveModal(ModalType.Receive, {
                    walletAccount: selectedWalletAccount,
                  })
                }
              >
                <p className="action-button-text">Receive</p>
              </div>
              <div
                className="action-button quaternary"
                onClick={() => setActiveModal(ModalType.Import)}
              >
                <p className="action-button-text">Import</p>
              </div>
              <div
                className="action-button quaternary"
                onClick={() =>
                  setActiveModal(ModalType.SelectExportType, {
                    currentUser,
                    selectedWallet,
                    selectedWalletAccount,
                  })
                }
              >
                <p className="action-button-text">Export</p>
              </div>
              <div
                className="action-button quaternary"
                onClick={receiveAirdrop}
              >
                <p className="action-button-text">Airdrop</p>
              </div>
            </div>
          </div>

          <p className="activity">Activity</p>

          {selectedWalletAccountInboundTransactions.length === 0 &&
          selectedWalletAccountOutboundTransactions.length === 0 ? (
            <div className="activity-table-empty">
              <p className="primary-text">You have no activity</p>
              <p className="secondary-text">
                Once you start sending and receiving Sepolia ETH, your activity
                will be shown here.
              </p>
            </div>
          ) : (
            <>
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Address</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedWalletAccountInboundTransactions.map(
                    (transfer, index) => {
                      const blockTimestamp = new Date(
                        transfer.metadata.blockTimestamp,
                      );
                      const blockTimestampString = new Intl.DateTimeFormat(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        },
                      )
                        .format(blockTimestamp)
                        .replace(" at ", " ");
                      return (
                        <tr key={index}>
                          <td className="transaction-status">
                            <div className="arrow-wrapper received-arrow-wrapper">
                              <img src={arrowDownBackground} />
                            </div>
                            <p>Received</p>
                          </td>
                          <td className="transaction-timestamp">{`${blockTimestampString}`}</td>
                          <td className="transaction-address">
                            <p>{`From: ${displayTruncatedAddress(transfer.from)}`}</p>
                          </td>
                          <td className="transaction-value">
                            <p>{`${parseFloat(transfer.value.toFixed(5))} ETH`}</p>
                            <p className="subscript">{`$${(transfer.value * ethereumPrice).toFixed(2)}`}</p>
                          </td>
                        </tr>
                      );
                    },
                  )}
                  {selectedWalletAccountOutboundTransactions.map(
                    (transfer, index) => {
                      const blockTimestamp = new Date(
                        transfer.metadata.blockTimestamp,
                      );
                      const blockTimestampString = new Intl.DateTimeFormat(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        },
                      )
                        .format(blockTimestamp)
                        .replace(" at ", " ");
                      return (
                        <tr key={index}>
                          <td className="transaction-status">
                            <div className="arrow-wrapper sent-arrow-wrapper">
                              <img src={arrowUpBackground} />
                            </div>
                            <p>Sent</p>
                          </td>
                          <td>{`${blockTimestampString}`}</td>
                          <td className="transaction-address">
                            <p>{`To: ${displayTruncatedAddress(transfer.to)}`}</p>
                          </td>
                          <td className="transaction-value">
                            <p>{`${parseFloat(transfer.value.toFixed(5))} ETH`}</p>
                            <p className="subscript">{`$${(transfer.value * ethereumPrice).toFixed(2)}`}</p>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
              <div className="activity-table-mobile">
                {selectedWalletAccountInboundTransactions.map(
                  (transfer, index) => {
                    const blockTimestamp = new Date(
                      transfer.metadata.blockTimestamp,
                    );
                    const blockTimestampString = new Intl.DateTimeFormat(
                      "en-US",
                      {
                        year: "numeric",
                        day: "numeric",
                        month: "short",
                      },
                    ).format(blockTimestamp);
                    return (
                      <div
                        className="asset-transfer inbound"
                        key={`inbound-${index}`}
                      >
                        <img src={arrowDownBackground} />
                        <div className="display-section">
                          <p className="display-title">Received</p>
                          <p className="display-address">{`From ${displayTruncatedAddress(transfer.from)}`}</p>
                        </div>
                        <div className="flex-spacer" />
                        <div className="value-section">
                          <p className="eth-value">{`${parseFloat(transfer.value.toFixed(5))} ETH`}</p>
                          <p className="timestamp">{`${blockTimestampString}`}</p>
                        </div>
                      </div>
                    );
                  },
                )}
                {selectedWalletAccountOutboundTransactions.map(
                  (transfer, index) => {
                    const blockTimestamp = new Date(
                      transfer.metadata.blockTimestamp,
                    );
                    const blockTimestampString = new Intl.DateTimeFormat(
                      "en-US",
                      {
                        year: "numeric",
                        day: "numeric",
                        month: "short",
                      },
                    ).format(blockTimestamp);
                    return (
                      <div
                        className="asset-transfer outbound"
                        key={`outbound-${index}`}
                      >
                        <img src={arrowUpBackground} />
                        <div className="display-section">
                          <p className="display-title">Sent</p>
                          <p className="display-address">{`To ${displayTruncatedAddress(transfer.to)}`}</p>
                        </div>
                        <div className="flex-spacer" />
                        <div className="value-section">
                          <p className="eth-value">{`${parseFloat(transfer.value.toFixed(5))} ETH`}</p>
                          <p className="timestamp">{`${blockTimestampString}`}</p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
