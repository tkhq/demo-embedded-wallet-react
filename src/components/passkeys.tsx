"use client"

import { useEffect, useState } from "react"
import { useTurnkey } from "@turnkey/sdk-react"
import { CircleMinus, X } from "lucide-react"

import { Authenticator } from "@/types/turnkey"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"

import AddPasskey from "./add-passkey"
import { Card } from "./ui/card"

export function Passkeys() {
  const { turnkey, getActiveClient } = useTurnkey()
  const { user } = useUser()
  const [authenticators, setAuthenticators] = useState<Authenticator[]>([])

  useEffect(() => {
    const getAuthenticators = async () => {
      const currentUserSession = await turnkey?.currentUserSession()
      if (currentUserSession) {
        const { authenticators } = await currentUserSession.getAuthenticators({
          userId: `${user?.userId}`,
        })
        setAuthenticators(authenticators)
      }
    }
    getAuthenticators()
  }, [turnkey, getActiveClient, user])

  const removeAuthenticator = async (authenticator: any) => {
    const activeClient = await getActiveClient()
    const authenticatorResponse = await activeClient?.deleteAuthenticators({
      userId: `${user?.userId}`,
      authenticatorIds: [authenticator.authenticatorId],
    })
    if (authenticatorResponse) {
      const nextAuthenticators = authenticators.filter(
        (x) => x.authenticatorId !== authenticator.authenticatorId
      )
      setAuthenticators(nextAuthenticators)
    }
  }

  const onPasskeyAdded = async (authenticatorId: string) => {
    const currentUserSession = await turnkey?.currentUserSession()
    const authenticatorResponse = await currentUserSession?.getAuthenticator({
      authenticatorId,
    })
    if (authenticatorResponse) {
      setAuthenticators((prev) => [
        ...prev,
        authenticatorResponse.authenticator,
      ])
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-4">
        <h3 className="text-lg font-semibold">Passkeys</h3>
        <AddPasskey onPasskeyAdded={onPasskeyAdded} />
      </div>
      <div className="flex flex-col gap-4">
        {authenticators.map((authenticator) => (
          <Card
            key={authenticator.authenticatorId}
            className="flex items-center justify-between rounded-md bg-card p-3"
          >
            <div className="flex items-center space-x-3">
              <span>
                {new Date(
                  Number(authenticator.createdAt.seconds) * 1000
                ).toLocaleDateString()}
              </span>
              <span className="text-muted-foreground">
                {authenticator.authenticatorName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAuthenticator(authenticator)}
            >
              <CircleMinus className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
