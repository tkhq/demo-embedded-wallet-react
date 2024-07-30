export const displayTruncatedAddress = (address: string): string => {
  try {
    const firstFour = address.substring(2, 6);
    const lastFour = address.substring(address.length - 4);

    return `0x${firstFour}...${lastFour}`;
  } catch (error) {
    return address;
  }
};

export const isValidEthereumAddress = (address: string): boolean => {
  if (address.length !== 42 || address.substring(0, 2) !== "0x") {
    return false;
  }

  const hexPart = address.substring(2);
  const hexRegex = /^[0-9a-fA-F]+$/;

  return hexRegex.test(hexPart);
};

export const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};
