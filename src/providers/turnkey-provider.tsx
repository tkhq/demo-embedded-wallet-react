import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { Turnkey, type TurnkeyBrowserClient } from "@turnkey/sdk-browser"

import { turnkeyConfig } from "@/config/turnkey"

export interface TurnkeyContextType {
  turnkey: Turnkey | undefined
  client: TurnkeyBrowserClient | undefined
}

export const TurnkeyContext = createContext<TurnkeyContextType>({
  turnkey: undefined,
  client: undefined,
})

export const useTurnkey = (): TurnkeyContextType => {
  const context = useContext(TurnkeyContext)
  if (!context) {
    throw new Error("useTurnkey must be used within a TurnkeyProvider")
  }
  return context
}

interface TurnkeyProviderProps {
  children: ReactNode
}

export const TurnkeyProvider: React.FC<TurnkeyProviderProps> = ({
  children,
}) => {
  const [turnkey, setTurnkey] = useState<Turnkey | undefined>(undefined)
  const [client, setClient] = useState<TurnkeyBrowserClient | undefined>(
    undefined
  )

  useEffect(() => {
    const newTurnkey = new Turnkey({
      apiBaseUrl: turnkeyConfig.apiBaseUrl,
      defaultOrganizationId: turnkeyConfig.organizationId,
    })
    newTurnkey.currentUserSession().then((client) => {
      setClient(client)
    })
    setTurnkey(newTurnkey)
  }, [])

  return (
    <TurnkeyContext.Provider value={{ turnkey, client }}>
      {children}
    </TurnkeyContext.Provider>
  )
}
