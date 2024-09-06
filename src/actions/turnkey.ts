"use server"

import { generateP256KeyPair } from "@turnkey/crypto"
import {
  ApiKeyStamper,
  DEFAULT_ETHEREUM_ACCOUNTS,
  Turnkey,
  TurnkeyServerClient,
} from "@turnkey/sdk-server"

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
  const organizationId = await getSubOrgIdByEmail(email as Email)

  if (organizationId?.length) {
    const authResponse = await client.emailAuth({
      email,
      targetPublicKey,
      organizationId,
      emailCustomization: {
        magicLinkTemplate: getMagicLinkTemplate("auth", email, "email"),
      },
    })

    console.log("authResponse", authResponse)
    return authResponse
  }
}

export const bugRepro = async () => {
  const { publicKey: servicePublicKey, privateKey: servicePrivateKey } =
    generateP256KeyPair()
  const { publicKey: userPublicKey, privateKey: userPrivateKey } =
    generateP256KeyPair()

  const { subOrganizationId, rootUserIds, wallet } =
    await client.createSubOrganization({
      subOrganizationName: "repro trojan bug",
      rootUsers: [
        {
          userName: "Provisioning User",
          apiKeys: [
            {
              apiKeyName: "Service",
              publicKey: servicePublicKey,
              curveType: "API_KEY_CURVE_P256",
            },
          ],
          authenticators: [],
          oauthProviders: [],
        },
        {
          userName: "End User",
          // We skip validation on the curve type here
          apiKeys: [
            {
              apiKeyName: "End User Key",
              publicKey: userPublicKey,
              curveType: "API_KEY_CURVE_P256",
            },
          ],
          authenticators: [],
          oauthProviders: [],
        },
      ],
      rootQuorumThreshold: 1,
      wallet: {
        walletName: "trojan bug wallet",
        accounts: DEFAULT_ETHEREUM_ACCOUNTS,
      },
    })
  console.log("createSubOrganizationResponse", {
    subOrganizationId,
    rootUserIds,
    wallet,
  })
  // Note that the order of the root users is important, as the first one is the one that gets the service account
  const serviceUserId = rootUserIds?.[0]
  const turnkeyUserId = rootUserIds?.[1]
  const walletAddress = wallet?.addresses[0]
  if (!serviceUserId || !turnkeyUserId || !walletAddress) {
    return
    throw new Error("Failed to create sub-organization")
  }

  // We use the service account client to provision the user's account
  const serviceClient = new Turnkey({
    apiBaseUrl: turnkeyConfig.apiBaseUrl,
    apiPublicKey: servicePublicKey,
    apiPrivateKey: servicePrivateKey,
    defaultOrganizationId: subOrganizationId,
  }).apiClient()

  // Create the tag used for signing accounts, for applying the permission policy
  const { userTagId } = await serviceClient.createUserTag({
    userTagName: "Signing Accounts",
    userIds: [],
  })

  const { publicKey: signerPublicKey } = generateP256KeyPair()
  const signingUser = await serviceClient.createUsers({
    users: [
      {
        userName: "Signing Account",
        apiKeys: [{ apiKeyName: "Signing", publicKey: signerPublicKey }],
        authenticators: [],
        userTags: [userTagId],
      },
    ],
  })

  const signingUserId = signingUser.userIds[0]
  if (!signingUserId) {
    // Ideally we'd undo the changes above here, but there doesn't seem to be a way to delete the sub-organization
    throw new Error("Failed to create signing account")
  }

  // Create the policy for the service account with least privileges
  const policy = await serviceClient.createPolicy({
    policyName: "Signing Account Policy",
    effect: "EFFECT_ALLOW",
    consensus: `approvers.any(user, user.tags.contains('${userTagId}'))`,
    condition:
      "activity.resource == 'PRIVATE_KEY' && activity.action == 'SIGN'",
    notes: "Only allow signing transactions",
  })
  console.log("policy", policy)

  const whoamiResponse = await serviceClient.getWhoami()
  const orgConfigsResponse = await serviceClient.getOrganizationConfigs({
    organizationId: process.env.ORGANIZATION_ID!,
  })
  console.log("whoamiResponse", whoamiResponse)
  console.log(
    "orgConfigsResponse - before root quorum update",
    JSON.stringify(orgConfigsResponse, null, 2)
  )
  // We can now deprovision the service account
  const updateRootQuorumResponse = await serviceClient.updateRootQuorum({
    threshold: 1,
    userIds: [turnkeyUserId],
  })
  console.log("updateRootQuorumResponse", updateRootQuorumResponse)
  const orgConfigsResponse2 = await serviceClient.getOrganizationConfigs({
    organizationId: process.env.ORGANIZATION_ID!,
  })

  console.log(
    "orgConfigsResponse - after root quorum update",
    JSON.stringify(orgConfigsResponse2, null, 2)
  )
  // const deleteResponse = await serviceClient.deleteUsers({
  //   userIds: [serviceUserId],
  // })
  // console.log("deleteResponse", deleteResponse)
}
