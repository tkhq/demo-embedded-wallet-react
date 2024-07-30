import React from "react";

export const useKeyPress = (targetKey: string, onKeyPress: () => void) => {
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        onKeyPress();
      }
    };

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, [targetKey, onKeyPress]);
};
