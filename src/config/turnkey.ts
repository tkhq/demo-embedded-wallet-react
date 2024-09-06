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
    // TODO: This should use the NEXT_PUBLIC_APP_URL which should be set by vercel for prod/preview deployments
    // and will use localhost for local development
    rpId: "localhost",
  },
}
