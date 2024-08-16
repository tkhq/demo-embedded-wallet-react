import { useContext } from "react";
import { FlashMessageContext } from "../contexts/FlashMessageContext";

export const useFlashMessage = () => {
  const context = useContext(FlashMessageContext);
  if (!context) {
    throw new Error(
      "useFlashMessage must be used within a FlashMessageProvider",
    );
  }
  return context;
};
