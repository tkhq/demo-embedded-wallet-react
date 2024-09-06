import type { TurnkeyIframeClient } from "@turnkey/sdk-browser"

import { turnkeyConfig } from "@/config/turnkey"

let client: TurnkeyIframeClient | undefined = undefined

export const getIFrameClient = async (): Promise<
  TurnkeyIframeClient | undefined
> => {
  if (!client) {
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

    client = new TurnkeyIframeClient({
      stamper: iframeStamper,
      apiBaseUrl: turnkeyConfig.apiBaseUrl,
      organizationId: turnkeyConfig.organizationId,
    })

    console.log("setting client", client)
  }

  return client
}
