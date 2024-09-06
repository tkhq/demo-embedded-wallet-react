import {
  IframeStamper,
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

let iFrameStamper: IframeStamper | undefined = undefined

export const getIFrameClient = async (): Promise<
  TurnkeyIframeClient | undefined
> => {
  if (!iFrameClient) {
    const { containerId, url, elementId } = turnkeyConfig.iFrame

    let iframeContainer = document.getElementById(containerId)

    if (!iframeContainer) {
      iframeContainer = document.createElement("div")
      iframeContainer.id = containerId
      iframeContainer.style.display = "none"
      document.body.appendChild(iframeContainer)
    }

    try {
      const { IframeStamper, TurnkeyIframeClient } = await import(
        "@turnkey/sdk-browser"
      )

      if (!iFrameStamper) {
        iFrameStamper = new IframeStamper({
          iframeContainer,
          iframeUrl: url,
          iframeElementId: elementId,
        })
      }
      await iFrameStamper.init()

      iFrameClient = new TurnkeyIframeClient({
        stamper: iFrameStamper,
        apiBaseUrl: turnkeyConfig.apiBaseUrl,
        organizationId: turnkeyConfig.organizationId,
      })
    } catch (error) {
      console.error("Failed to initialize iFrameClient", error)
      // remove the iframeContainer if initialization fails
      if (iframeContainer) {
        iframeContainer.remove()
      }
    }
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
