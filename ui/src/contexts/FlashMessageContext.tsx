import { createContext, useState } from "react";

interface FlashMessage {
  message: string;
  type: "success" | "pending" | "error" | "info";
}

interface FlashMessageContextProps {
  flashMessage: FlashMessage | undefined;
  setFlashMessage: React.Dispatch<
    React.SetStateAction<FlashMessage | undefined>
  >;
}

export const FlashMessageContext = createContext<
  FlashMessageContextProps | undefined
>(undefined);

export const FlashMessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flashMessage, setFlashMessage] = useState<FlashMessage | undefined>(
    undefined,
  );

  return (
    <FlashMessageContext.Provider value={{ flashMessage, setFlashMessage }}>
      {children}
    </FlashMessageContext.Provider>
  );
};
