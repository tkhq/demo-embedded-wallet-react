import logomarkBlack from "../assets/logomark-black.svg";
import logoBlack from "../assets/logo-black.svg";
import logomarkWhite from "../assets/logomark-white.svg";
import logoWhite from "../assets/logo-white.svg";

interface BrandingProps {
  logomarkColor?: "black" | "white";
  onClick?: () => void;
}

export const Branding: React.FC<BrandingProps> = ({
  logomarkColor = "black",
  onClick = () => undefined,
}) => {
  return (
    <div className="branding" onClick={onClick}>
      {logomarkColor === "black" ? (
        <img className="logomark" src={logomarkBlack} />
      ) : null}
      {logomarkColor === "white" ? (
        <img className="logomark" src={logomarkWhite} />
      ) : null}
      {logomarkColor === "black" ? (
        <img className="logo" src={logoBlack} />
      ) : null}
      {logomarkColor === "white" ? (
        <img className="logo" src={logoWhite} />
      ) : null}
    </div>
  );
};
