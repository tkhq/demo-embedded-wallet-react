"use server"

import { createActivityPoller, TurnkeyClient } from "@turnkey/http"
import { ApiKeyStamper } from "@turnkey/sdk-browser"
import {
  Turnkey,
  TurnkeyApiClient,
  TurnkeyServerClient,
} from "@turnkey/sdk-server"

import { env } from "@/env.mjs"
import { turnkeyConfig } from "@/config/turnkey"

let turnkeyServerClient: TurnkeyServerClient | null = null

const { TURNKEY_API_PUBLIC_KEY, TURNKEY_API_PRIVATE_KEY } = env

export const getTurnkeyServerClient = (): TurnkeyServerClient => {
  if (!turnkeyServerClient) {
    const stamper = new ApiKeyStamper({
      apiPublicKey: TURNKEY_API_PUBLIC_KEY,
      apiPrivateKey: TURNKEY_API_PRIVATE_KEY,
    })

    turnkeyServerClient = new TurnkeyServerClient({
      apiBaseUrl: turnkeyConfig.apiBaseUrl,
      organizationId: turnkeyConfig.organizationId,
      stamper,
    })
  }

  return turnkeyServerClient
}
