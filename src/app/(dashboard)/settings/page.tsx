"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallets } from "@/providers/wallet-provider"
import { ArrowLeft, Mail } from "lucide-react"
import { useLocalStorage } from "usehooks-ts"

import { PreferredWallet, Wallet } from "@/types/turnkey"
import { PREFERRED_WALLET_KEY } from "@/lib/constants"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Passkeys } from "@/components/passkeys"

export default function Settings() {
  const router = useRouter()
  const { user } = useUser()
  const [preferredWalletSetting, setPreferredWalletSetting] =
    useLocalStorage<PreferredWallet>(PREFERRED_WALLET_KEY, {
      userId: "",
      walletId: "",
    })
  const { state } = useWallets()
  const [preferredWallet, setPreferredWallet] = useState<Wallet | undefined>()
  useEffect(() => {
    if (state.wallets.length > 0) {
      const wallet = state.wallets.find(
        (wallet) => wallet.walletId === preferredWalletSetting.walletId
      )
      if (wallet) {
        setPreferredWallet(wallet)
      }
    }
  }, [state.wallets, preferredWalletSetting])

  return (
    <main className="flex items-center justify-center px-36 py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <div className="flex items-center gap-2">
          <Button
            className="-mb-0.5"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft strokeWidth={2.5} className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Login methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Email</h3>
              <Card className="flex items-center justify-between rounded-md bg-card p-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>Email</span>
                </div>
                <span className="text-muted-foreground">{user?.email}</span>
              </Card>
            </div>
            <Passkeys />
          </CardContent>
        </Card>
        {/* <Card className="w-full">
          <CardHeader>
            <CardTitle>Wallets</CardTitle>
            <CardDescription>Manage your wallets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Default wallet</h3>
              <Card className="flex w-max items-center justify-between rounded-md bg-card p-3">
                <div className="flex items-center space-x-3">
                  <WalletIcon className="h-5 w-5 text-muted-foreground" />
                  <span>{preferredWallet?.walletName}</span>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </main>
  )
}
