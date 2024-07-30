import { ImportWallet } from "../components/ImportWallet";
import { useNavigate } from "react-router-dom";
import { useFlashMessage } from "../hooks/useFlashMessage";

export const ImportScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setFlashMessage } = useFlashMessage();

  return (
    <div className="screen import-screen">
      <ImportWallet
        onCancel={() => navigate("/dashboard")}
        onWalletImportSuccess={() => {
          setFlashMessage({
            message: "Successfully Imported Wallet",
            type: "success",
          });
          navigate("/dashboard");
        }}
        onPrivateKeyImportSuccess={() => {
          setFlashMessage({
            message: "Successfully Imported Private Key",
            type: "success",
          });
          navigate("/dashboard");
        }}
        onError={(message) => {
          setFlashMessage({ message: message, type: "error" });
        }}
      />
    </div>
  );
};
