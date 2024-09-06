// // ts-node turnkey-scripts/testTransaction2WithViem.ts

// import * as dotenv from "dotenv";
// import { createAccount } from "@turnkey/viem";
// import { TurnkeyClient } from "@turnkey/http";
// import { ApiKeyStamper } from "@turnkey/api-key-stamper";
// import {
//   createWalletClient,
//   createPublicClient,
//   http,
//   type Account,
//   parseUnits,
// } from "viem";
// import { optimism } from "viem/chains";
// import { SIG_CHAINS } from "./utils";

// dotenv.config();

// const OP_ERC20_TOKEN_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";

// async function main() {
//   const turnkeyClient = new TurnkeyClient(
//     { baseUrl: "https://api.turnkey.com" },
//     new ApiKeyStamper({
//       apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
//       apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
//     })
//   );

//   const turnkeyAccount = await createAccount({
//     client: turnkeyClient,
//     organizationId: process.env.SUBORG_ID!,
//     signWith: process.env.SUBORG_WALLET_ADDRESS!,
//   });

//   const client = createWalletClient({
//     account: turnkeyAccount as Account,
//     chain: optimism,
//     transport: http(SIG_CHAINS.OPTIMISM_MAINNET.RPC_URL),
//   });

//   const address = client.account.address;
//   console.log("Signer address:", address);

//   const publicClient = createPublicClient({
//     chain: optimism,
//     transport: http(SIG_CHAINS.OPTIMISM_MAINNET.RPC_URL),
//   });

//   // Check ETH balance
//   const balance = await publicClient.getBalance({ address });
//   console.log("ETH Balance:", balance);

//   // Check token balance and get decimals
//   const tokenBalance = await publicClient.readContract({
//     address: OP_ERC20_TOKEN_ADDRESS,
//     abi: ERC20_ABI,
//     functionName: "balanceOf",
//     args: [address],
//   });
//   const decimals = await publicClient.readContract({
//     address: OP_ERC20_TOKEN_ADDRESS,
//     abi: ERC20_ABI,
//     functionName: "decimals",
//   });
//   console.log("Token Balance:", tokenBalance);
//   console.log("Token Decimals:", decimals);

//   // Recipient address and amount to send
//   const recipientAddress = "0x6F709dcf0303E7e32014a6b755CA7982E1E7aE36";
//   const amount = parseUnits("10", 2);

//   console.log("Transaction details:", {
//     recipientAddress,
//     amount: amount.toString(),
//   });

//   try {
//     console.log("Simulating contract call...");
//     const { request } = await publicClient.simulateContract({
//       account: client.account,
//       address: OP_ERC20_TOKEN_ADDRESS,
//       abi: ERC20_ABI,
//       functionName: "transfer",
//       args: [recipientAddress, amount],
//     });

//     console.log("Simulation successful. Sending transaction...");
//     const hash = await client.writeContract(request);
//     console.log("ERC-20 transfer transaction sent:", hash);

//     console.log("Waiting for transaction receipt...");
//     const receipt = await publicClient.waitForTransactionReceipt({ hash });
//     console.log(
//       "ERC-20 transfer transaction confirmed:",
//       receipt.transactionHash
//     );
//   } catch (error: any) {
//     console.error("Error details:", error);
//     if (error.cause) {
//       console.error("Error cause:", error.cause);
//     }
//     if (error.details) {
//       console.error("Error details:", error.details);
//     }
//     console.error("Error stack:", error.stack);
//   }
// }

// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });

// const ERC20_ABI = [
//   {
//     constant: true,
//     inputs: [{ name: "_owner", type: "address" }],
//     name: "balanceOf",
//     outputs: [{ name: "balance", type: "uint256" }],
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "decimals",
//     outputs: [{ name: "", type: "uint8" }],
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [
//       { name: "_to", type: "address" },
//       { name: "_value", type: "uint256" },
//     ],
//     name: "transfer",
//     outputs: [{ name: "", type: "bool" }],
//     type: "function",
//   },
// ] as const;
