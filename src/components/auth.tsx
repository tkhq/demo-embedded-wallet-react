"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { useTurnkey } from "@turnkey/sdk-react"

import { Email } from "@/types/turnkey"
import { useUser } from "@/hooks/use-user"

import GoogleAuth from "./google-auth"
import { Icons } from "./icons"
import Legal from "./legal"
import { Button } from "./ui/button"
import { LoadingButton } from "./ui/button.loader"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Separator } from "./ui/separator"

export default function Auth() {
  const { user } = useUser()
  const { passkeyClient } = useTurnkey()
  const { initEmailLogin, state, loginWithPasskey } = useAuth()
  const [email, setEmail] = useState<string>("")

  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user])

  const handlePasskeyLogin = async () => {
    setLoadingAction("passkey")
    if (!email || !passkeyClient) {
      setLoadingAction(null)
      return
    }

    await loginWithPasskey(email as Email)
    setLoadingAction(null)
  }

  const handleEmailLogin = async () => {
    setLoadingAction("email")
    await initEmailLogin(email as Email)
    setLoadingAction(null)
  }

  return (
    <>
      <Card className="mx-auto w-5/6 sm:w-7/12 lg:w-2/3 lg:max-w-md">
        <CardHeader className="space-y-4">
          <Icons.turnkey className="h-16 w-full  stroke-0 py-2 dark:stroke-white" />
          <CardTitle className="text-center text-xl font-medium">
            Login or Sign up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <LoadingButton
              disabled={!email}
              onClick={handlePasskeyLogin}
              loading={state.loading && loadingAction === "passkey"}
            >
              Continue with passkey
            </LoadingButton>

            <LoadingButton
              disabled={!email}
              variant="outline"
              className="w-full font-semibold"
              onClick={handleEmailLogin}
              loading={state.loading && loadingAction === "email"}
            >
              Continue with Email
            </LoadingButton>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <GoogleAuth loading={state.loading && loadingAction === "email"} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button disabled variant="outline" className="w-full font-semibold">
              Continue with Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
      <Legal />
    </>
  )
}
