import { env } from "@/env.mjs"
import { getEffectiveDomain } from "@/lib/utils"

import { siteConfig } from "./site"

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
    rpId: getEffectiveDomain(siteConfig.url.base) || "localhost",
  },
}
