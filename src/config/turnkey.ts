import { env } from "@/env.mjs"

const { NEXT_PUBLIC_ORGANIZATION_ID, NEXT_PUBLIC_BASE_URL } = env

export const turnkeyConfig = {
  apiBaseUrl: NEXT_PUBLIC_BASE_URL,
  organizationId: NEXT_PUBLIC_ORGANIZATION_ID,
  iFrame: {
    url: "https://auth.turnkey.com",
    elementId: "turnkey-auth-iframe-element-id",
    containerId: "turnkey-auth-iframe-container-id",
  },
  passkey: {
    rpId: env.NEXT_PUBLIC_RP_ID || "localhost",
  },
  rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
}
