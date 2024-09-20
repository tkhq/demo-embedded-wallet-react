import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: "GgXvRB-Vj4mNQU7JC_1bPW1e39-pIFZ5",
  network: Network.ETH_SEPOLIA,
};

export const alchemy = new Alchemy(settings);
