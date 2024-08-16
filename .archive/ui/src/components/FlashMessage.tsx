import { useEffect, useState } from "react";
import { useFlashMessage } from "../hooks/useFlashMessage";
import { useLocation } from "react-router-dom";
import { Spinner } from "../components/Spinner";

import closeIcon from "../assets/close-icon.svg";
import flashSuccess from "../assets/flash-success.svg";

export const FlashMessage: React.FC = () => {
  const location = useLocation();
  const { flashMessage, setFlashMessage } = useFlashMessage();

  const [flashNavigationCounter, setFlashNavigationCounter] =
    useState<number>(0);

  useEffect(() => {
    setFlashNavigationCounter(0);
    if (flashMessage?.type === "success") {
      setTimeout(() => {
        setFlashMessage(undefined);
        setFlashNavigationCounter(0);
      }, 2000);
    }
  }, [flashMessage]);

  useEffect(() => {
    if (flashMessage) {
      const nextFlashNavigationCounter = flashNavigationCounter + 1;
      if (nextFlashNavigationCounter >= 2) {
        setFlashMessage(undefined);
        setFlashNavigationCounter(0);
      } else {
        setFlashNavigationCounter(nextFlashNavigationCounter);
      }
    }
  }, [location.pathname]);

  if (!flashMessage) {
    return null;
  }

  return (
    <div className={`Flash-Message ${flashMessage.type}`}>
      {flashMessage.type === "success" ? (
        <img src={flashSuccess} className="flash-success" />
      ) : null}
      {flashMessage.type === "pending" ? <Spinner spinnerType="Chase" /> : null}
      <p className="message-text">{flashMessage.message}</p>
      <div className="flex-spacer" />
      <img
        src={closeIcon}
        className="close"
        onClick={() => setFlashMessage(undefined)}
      />
    </div>
  );
};
