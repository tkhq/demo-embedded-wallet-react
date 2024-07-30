import { ExportWallet } from "../components/ExportWallet";
import { useNavigate } from "react-router-dom";
import { useFlashMessage } from "../hooks/useFlashMessage";

export const ExportScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setFlashMessage } = useFlashMessage();

  return (
    <div className="screen export-screen">
      <ExportWallet
        onCancel={() => navigate("/dashboard")}
        onError={(message) => {
          setFlashMessage({ message: message, type: "error" });
        }}
      />
    </div>
  );
};
