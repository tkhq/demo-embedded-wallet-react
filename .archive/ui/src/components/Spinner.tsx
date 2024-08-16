import React from "react";

type SpinnerProps = {
  spinnerType: string;
};

export const Spinner: React.FC<SpinnerProps> = ({ spinnerType }) => {
  const renderSpinner = () => {
    switch (spinnerType) {
      case "Plane":
        return <div className="sk-plane"></div>;
      case "Chase":
        return (
          <div className="sk-chase">
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
          </div>
        );
      case "Bounce":
        return (
          <div className="sk-bounce">
            <div className="sk-bounce-dot"></div>
            <div className="sk-bounce-dot"></div>
          </div>
        );
      case "Wave":
        return (
          <div className="sk-wave">
            <div className="sk-wave-rect"></div>
            <div className="sk-wave-rect"></div>
            <div className="sk-wave-rect"></div>
            <div className="sk-wave-rect"></div>
            <div className="sk-wave-rect"></div>
          </div>
        );
      case "Pulse":
        return <div className="sk-pulse"></div>;
      case "Flow":
        return (
          <div className="sk-flow">
            <div className="sk-flow-dot"></div>
            <div className="sk-flow-dot"></div>
            <div className="sk-flow-dot"></div>
          </div>
        );
      case "Swing":
        return (
          <div className="sk-swing">
            <div className="sk-swing-dot"></div>
            <div className="sk-swing-dot"></div>
          </div>
        );
      case "Circle":
        return (
          <div className="sk-circle">
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
            <div className="sk-circle-dot"></div>
          </div>
        );
      case "CircleFade":
        return (
          <div className="sk-circle-fade">
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
            <div className="sk-circle-fade-dot"></div>
          </div>
        );
      case "Grid":
        return (
          <div className="sk-grid">
            <div className="sk-grid-cube"></div>
            <div className="sk-grid-cube"></div>
            <div className="sk-grid-cube"></div>
            <div className="sk-grid-cube"></div>
            <div className="sk-grid-cube"></div>
            <div className="sk-grid-cube"></div>
            <div className="sk-grid-cube"></div>
            <div className="sk-grid-cube"></div>
            <div className="sk-grid-cube"></div>
          </div>
        );
      case "Fold":
        return (
          <div className="sk-fold">
            <div className="sk-fold-cube"></div>
            <div className="sk-fold-cube"></div>
            <div className="sk-fold-cube"></div>
            <div className="sk-fold-cube"></div>
          </div>
        );
      case "Wander":
        return (
          <div className="sk-wander">
            <div className="sk-wander-cube"></div>
            <div className="sk-wander-cube"></div>
            <div className="sk-wander-cube"></div>
          </div>
        );
    }
  };

  return <div className="spinner-container">{renderSpinner()}</div>;
};
