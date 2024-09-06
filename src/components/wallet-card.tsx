"use client"

import { CopyIcon } from "lucide-react"

import { truncateAddress } from "@/lib/utils"
import { useWallets } from "@/hooks/use-wallets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Skeleton } from "./ui/skeleton"

export default function Component() {
  const { selectedWallet, selectedAccount } = useWallets()
  const walletAddress = "0xCE27...8aaD"
  const usdAmount = 13.15
  const ethAmount = 0.005

  return (
    <Card className="w-[300px]  ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {selectedWallet?.walletName || (
            <Skeleton className="h-4 w-20 bg-muted-foreground/50" />
          )}
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-4 w-4">
          <CopyIcon className="h-4 w-4" />
          <span className="sr-only">Copy wallet address</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-xs ">
          {selectedAccount?.address ? (
            truncateAddress(selectedAccount?.address)
          ) : (
            <Skeleton className="h-3 w-32  rounded-sm bg-muted-foreground/50" />
          )}
        </div>
        <div className="text-4xl font-bold">
          ${usdAmount.toFixed(2)}
          <span className="text-sm text-muted-foreground">USD</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {ethAmount.toFixed(3)} ETH
        </div>
      </CardContent>
    </Card>
  )
}
