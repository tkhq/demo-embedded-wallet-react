import { useContext, useEffect, useState } from "react"
import { TurnkeyContext } from "@/providers/turnkey-provider"
import { TurnkeyPasskeyClient, WebauthnStamper } from "@turnkey/sdk-browser"

import { turnkeyConfig } from "@/config/turnkey"

export const usePasskey = () => {
  const { turnkey } = useContext(TurnkeyContext)
  const [client, setClient] = useState<TurnkeyPasskeyClient | undefined>(
    undefined
  )

  useEffect(() => {
    if (!client && turnkey) {
      const initializeClient = async () => {
        console.log("initializing client")
        const { TurnkeyPasskeyClient, WebauthnStamper } = await import(
          "@turnkey/sdk-browser"
        )

        const { apiBaseUrl, organizationId, passkey } = turnkeyConfig
        const stamper = new WebauthnStamper({
          rpId: passkey.rpId,
        })

        const newPasskeyClient = new TurnkeyPasskeyClient({
          stamper,
          apiBaseUrl,
          organizationId,
        })

        setClient(newPasskeyClient)
      }
      initializeClient()
    }
  }, [turnkey, client])

  return { client }
}
