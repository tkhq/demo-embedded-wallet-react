import { TurnkeyApiTypes, type TurnkeyClient } from "@turnkey/http"
import { Turnkey } from "@turnkey/sdk-browser"
import { Address } from "viem"

export type Attestation = Parameters<
  TurnkeyClient["createSubOrganization"]
>[0]["parameters"]["rootUsers"][0]["authenticators"][0]["attestation"]

export type Email = `${string}@${string}.${string}`

export type Account = Omit<
  TurnkeyApiTypes["v1GetWalletAccountsResponse"]["accounts"][number],
  "address"
> & {
  address: Address
  balance: bigint | undefined
}
export type Wallet =
  TurnkeyApiTypes["v1GetWalletsResponse"]["wallets"][number] & {
    accounts: Account[]
  }

export type User = Awaited<ReturnType<Turnkey["getCurrentUser"]>> & {
  email?: Email
}

export type Authenticator =
  TurnkeyApiTypes["v1GetAuthenticatorsResponse"]["authenticators"][number]
