"use server"

import { generateP256KeyPair } from "@turnkey/crypto"
import { ApiKeyStamper, TurnkeyServerClient } from "@turnkey/sdk-server"

import { env } from "@/env.mjs"
import { Attestation, Email } from "@/types/turnkey"
import { siteConfig } from "@/config/site"
import { turnkeyConfig } from "@/config/turnkey"

const { TURNKEY_API_PUBLIC_KEY, TURNKEY_API_PRIVATE_KEY } = env

const stamper = new ApiKeyStamper({
  apiPublicKey: TURNKEY_API_PUBLIC_KEY,
  apiPrivateKey: TURNKEY_API_PRIVATE_KEY,
})

const client = new TurnkeyServerClient({
  apiBaseUrl: turnkeyConfig.apiBaseUrl,
  organizationId: turnkeyConfig.organizationId,
  stamper,
})

type EmailParam = { email: Email }
type PublicKeyParam = { publicKey: string }
type UsernameParam = { username: string }

export function getSubOrgId(param: EmailParam): Promise<string>
export function getSubOrgId(param: PublicKeyParam): Promise<string>
export function getSubOrgId(param: UsernameParam): Promise<string>

export async function getSubOrgId(
  param: EmailParam | PublicKeyParam | UsernameParam
): Promise<string> {
  let filterType: string
  let filterValue: string

  if ("email" in param) {
    filterType = "EMAIL"
    filterValue = param.email
  } else if ("publicKey" in param) {
    filterType = "PUBLIC_KEY"
    filterValue = param.publicKey
  } else if ("username" in param) {
    filterType = "USERNAME"
    filterValue = param.username
  } else {
    throw new Error("Invalid parameter")
  }

  const { organizationIds } = await client.getSubOrgIds({
    organizationId: turnkeyConfig.organizationId,
    filterType,
    filterValue,
  })

  return organizationIds[0]
}

export const getSubOrgIdByEmail = async (email: Email) => {
  return getSubOrgId({ email })
}

export const getSubOrgIdByPublicKey = async (publicKey: string) => {
  return getSubOrgId({ publicKey })
}

export const getSubOrgIdByUsername = async (username: string) => {
  return getSubOrgId({ username })
}

// @todo: Add overloads for creating suborgs with wallets, vs passkeys

export const createUserSubOrg = async ({
  email,
  challenge,
  attestation,
}: {
  email: Email
  challenge: string
  attestation: Attestation
}) => {
  const authenticators =
    challenge && attestation
      ? [
          {
            authenticatorName: "Passkey",
            challenge,
            attestation,
          },
        ]
      : []

  const subOrganizationName = `Sub Org - ${email}`
  const userName = email.split("@")?.[0] || email

  const subOrg = await client.createSubOrganization({
    organizationId: turnkeyConfig.organizationId,
    subOrganizationName,
    rootUsers: [
      {
        userName,
        userEmail: email,
        oauthProviders: [],
        authenticators,
        apiKeys: [],
      },
    ],
    rootQuorumThreshold: 1,
  })

  return subOrg
}

const getMagicLinkTemplate = (action: string, email: string, method: string) =>
  `${siteConfig.url.base}/email-${action}?userEmail=${email}&continueWith=${method}&credentialBundle=%s`

export const initEmailAuth = async ({
  email,
  targetPublicKey,
}: {
  email: Email
  targetPublicKey: string
}) => {
  console.log("initEmailAuth", email, targetPublicKey)
  const organizationId = await getSubOrgIdByEmail(email as Email)
  const magicLinkTemplate = getMagicLinkTemplate("auth", email, "email")
  console.log("magicLinkTemplate", magicLinkTemplate)
  if (organizationId?.length) {
    const authResponse = await client.emailAuth({
      email,
      targetPublicKey,
      organizationId,
      emailCustomization: {
        magicLinkTemplate,
      },
    })

    console.log("authResponse", authResponse)
    return authResponse
  }
}
