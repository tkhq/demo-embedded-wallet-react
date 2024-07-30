import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { TurnkeyProvider, useTurnkey } from "@turnkey/sdk-react";

import { TurnkeyHeader } from "./components/TurnkeyHeader";

import { LoginScreen } from "./screens/LoginScreen";
import { UserDashboardScreen } from "./screens/UserDashboardScreen";
import { ExportScreen } from "./screens/ExportScreen";
import { ImportScreen } from "./screens/ImportScreen";

import { LandingScreen } from "./screens/LandingScreen";
import { AddPasskeyScreen } from "./screens/AddPasskeyScreen";
import { CreateWalletScreen } from "./screens/CreateWalletScreen";
import { EmailVerificationScreen } from "./screens/EmailVerificationScreen";
import { EmailAuthScreen } from "./screens/EmailAuthScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

import { FlashMessage } from "./components/FlashMessage";
import { FlashMessageProvider } from "./contexts/FlashMessageContext";
import { ModalProvider } from "./contexts/ModalContext";
import { getTokenPrice } from "./services/CoingeckoService";

const turnkeyConfig = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL!,
  serverSignUrl: process.env.REACT_APP_SERVER_SIGN_URL!,
  defaultOrganizationId: process.env.REACT_APP_DEFAULT_ORGANIZATION_ID!,
};

interface LocationListenerProps {
  setCurrentUser: Dispatch<SetStateAction<any | undefined>>;
  setReadWriteSession: Dispatch<SetStateAction<any | undefined>>;
  setWallets: Dispatch<SetStateAction<any | undefined>>;
  selectedWallet: any;
  setSelectedWallet: Dispatch<SetStateAction<any | undefined>>;
  setWalletAccounts: Dispatch<SetStateAction<any | undefined>>;
  selectedWalletAccount: any;
  setSelectedWalletAccount: Dispatch<SetStateAction<any | undefined>>;
  setUserDropdownOpen: Dispatch<SetStateAction<boolean>>;
}

const LocationListener: React.FC<LocationListenerProps> = ({
  setCurrentUser = () => undefined,
  setReadWriteSession = () => undefined,
  setWallets = () => undefined,
  selectedWallet = undefined,
  setSelectedWallet = () => undefined,
  setWalletAccounts = () => undefined,
  selectedWalletAccount = undefined,
  setSelectedWalletAccount = () => undefined,
  setUserDropdownOpen = () => undefined,
}) => {
  const location = useLocation();
  const { turnkey } = useTurnkey();
  const navigate = useNavigate();

  useEffect(() => {
    setUserDropdownOpen(false);

    (async () => {
      if (turnkey) {
        setCurrentUser(await turnkey.getCurrentUser());
        setReadWriteSession(await turnkey.getReadWriteSession());
        const currentUserSession = await turnkey?.currentUserSession();
        if (currentUserSession) {
          const walletsResponse = await currentUserSession.getWallets();
          if (
            (location.pathname === "/dashboard" || location.pathname === "/") &&
            walletsResponse.wallets.length === 0
          ) {
            navigate("/create-wallet");
          }
          if (walletsResponse) {
            setWallets(walletsResponse.wallets);
            if (!selectedWallet) {
              setSelectedWallet(walletsResponse.wallets[0]);
            }
          }
        } else {
          setWallets([]);
          setSelectedWallet(undefined);
          setWalletAccounts([]);
          setSelectedWalletAccount(undefined);
          if (location.pathname === "/dashboard") {
            navigate("/");
          }
        }
      }
    })();
  }, [location, turnkey]);

  useEffect(() => {
    if (turnkey) {
      (async () => {
        const currentUserSession = await turnkey?.currentUserSession();
        if (currentUserSession) {
          if (selectedWallet) {
            const walletAccountsResponse =
              await currentUserSession?.getWalletAccounts({
                walletId: selectedWallet.walletId,
              });
            if (walletAccountsResponse) {
              setWalletAccounts(walletAccountsResponse.accounts);
              setSelectedWalletAccount(walletAccountsResponse.accounts[0]);
            }
          }
        }
      })();
    }
  }, [selectedWallet]);

  return null;
};

export const App: React.FC = () => {
  const [ethereumPrice, setEthereumPrice] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any | undefined>(undefined);
  const [readWriteSession, setReadWriteSession] = useState<any | undefined>(
    undefined,
  );
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(undefined);
  const [walletAccounts, setWalletAccounts] = useState<any[]>([]);
  const [selectedWalletAccount, setSelectedWalletAccount] =
    useState<any>(undefined);

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      !target.closest(".user-dropdown-container") &&
      !target.closest(".dropdown-control")
    ) {
      setUserDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  useEffect(() => {
    (async () => {
      const tokenResponse = await getTokenPrice("ethereum");
      const tokenData = await tokenResponse.json();
      if (tokenData.ethereum) {
        setEthereumPrice(tokenData.ethereum.usd);
      }
    })();
  }, []);

  return (
    <div className="App">
      <Router>
        <TurnkeyProvider config={turnkeyConfig}>
          <FlashMessageProvider>
            <ModalProvider>
              <div className="Container">
                <div className="Screen">
                  <FlashMessage />
                  <LocationListener
                    setCurrentUser={setCurrentUser}
                    setReadWriteSession={setReadWriteSession}
                    setWallets={setWallets}
                    selectedWallet={selectedWallet}
                    setSelectedWallet={setSelectedWallet}
                    setWalletAccounts={setWalletAccounts}
                    selectedWalletAccount={selectedWalletAccount}
                    setSelectedWalletAccount={setSelectedWalletAccount}
                    setUserDropdownOpen={setUserDropdownOpen}
                  />
                  <TurnkeyHeader
                    userDropdownOpen={userDropdownOpen}
                    setUserDropdownOpen={setUserDropdownOpen}
                    currentUser={currentUser}
                    readWriteSession={readWriteSession}
                    setReadWriteSession={setReadWriteSession}
                    wallets={wallets}
                    selectedWallet={selectedWallet}
                    setSelectedWallet={setSelectedWallet}
                    walletAccounts={walletAccounts}
                    setWalletAccounts={setWalletAccounts}
                    selectedWalletAccount={selectedWalletAccount}
                    setSelectedWalletAccount={setSelectedWalletAccount}
                  />
                  <Routes>
                    <Route
                      path="/"
                      element={
                        currentUser ? (
                          <UserDashboardScreen
                            ethereumPrice={ethereumPrice}
                            currentUser={currentUser}
                            selectedWallet={selectedWallet}
                            selectedWalletAccount={selectedWalletAccount}
                          />
                        ) : (
                          <LandingScreen />
                        )
                      }
                    />
                    <Route path="/add-passkey" element={<AddPasskeyScreen />} />
                    <Route
                      path="/create-wallet"
                      element={<CreateWalletScreen />}
                    />
                    <Route
                      path="/email-verification"
                      element={<EmailVerificationScreen />}
                    />
                    <Route path="/email-auth" element={<EmailAuthScreen />} />
                    <Route path="/login" element={<LoginScreen />} />
                    <Route
                      path="/dashboard"
                      element={
                        <UserDashboardScreen
                          ethereumPrice={ethereumPrice}
                          currentUser={currentUser}
                          selectedWallet={selectedWallet}
                          selectedWalletAccount={selectedWalletAccount}
                        />
                      }
                    />
                    <Route path="/export" element={<ExportScreen />} />
                    <Route path="/import" element={<ImportScreen />} />
                    <Route path="/landing" element={<LandingScreen />} />
                    <Route
                      path="/settings"
                      element={<SettingsScreen currentUser={currentUser} />}
                    />
                  </Routes>
                </div>
              </div>
            </ModalProvider>
          </FlashMessageProvider>
        </TurnkeyProvider>
      </Router>
    </div>
  );
};

export default App;
