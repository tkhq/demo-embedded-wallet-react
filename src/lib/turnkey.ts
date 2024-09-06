import {
  Turnkey,
  TurnkeyBrowserClient,
  TurnkeyIframeClient,
  TurnkeyPasskeyClient,
  WebauthnStamper,
} from "@turnkey/sdk-browser"

import { turnkeyConfig } from "@/config/turnkey"

let turnkeyClient: Turnkey | undefined = undefined
let browserClient: TurnkeyBrowserClient | undefined = undefined
let iFrameClient: TurnkeyIframeClient | undefined = undefined
let passKeyClient: TurnkeyPasskeyClient | undefined = undefined

export const getTurnkeyClient = (): Turnkey => {
  if (!turnkeyClient) {
    turnkeyClient = new Turnkey({
      apiBaseUrl: turnkeyConfig.apiBaseUrl,
      defaultOrganizationId: turnkeyConfig.organizationId,
    })
  }
  return turnkeyClient
}

export const getBrowserClient = async (): Promise<
  TurnkeyBrowserClient | undefined
> => {
  if (!browserClient) {
    browserClient = await getTurnkeyClient().currentUserSession()
  }
  return browserClient
}

export const getIFrameClient = async (): Promise<TurnkeyIframeClient> => {
  if (!iFrameClient) {
    const { containerId, url, elementId } = turnkeyConfig.iFrame

    let iframeContainer = document.getElementById(containerId)

    if (!iframeContainer) {
      iframeContainer = document.createElement("div")
      iframeContainer.id = containerId
      iframeContainer.style.display = "none"
      document.body.appendChild(iframeContainer)
    }

    const { IframeStamper, TurnkeyIframeClient } = await import(
      "@turnkey/sdk-browser"
    )

    const iframeStamper = new IframeStamper({
      iframeContainer,
      iframeUrl: url,
      iframeElementId: elementId,
    })

    await iframeStamper.init()

    iFrameClient = new TurnkeyIframeClient({
      stamper: iframeStamper,
      apiBaseUrl: turnkeyConfig.apiBaseUrl,
      organizationId: turnkeyConfig.organizationId,
    })

    console.log("setting client", iFrameClient)
  }

  return iFrameClient
}

export const getPassKeyClient = async (): Promise<TurnkeyPasskeyClient> => {
  if (!passKeyClient) {
    const { apiBaseUrl, organizationId, passkey } = turnkeyConfig

    const stamper = new WebauthnStamper({
      rpId: passkey.rpId,
    })

    passKeyClient = new TurnkeyPasskeyClient({
      stamper,
      apiBaseUrl,
      organizationId,
    })

    console.log("setting passkey client", passkey.rpId)
  }

  return passKeyClient
}
