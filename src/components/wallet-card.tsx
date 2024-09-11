"use client"

import { useEffect, useState } from "react"
import { useWallets } from "@/providers/wallet-provider"
import { CopyIcon, HandCoins, Upload } from "lucide-react"
import { toast } from "sonner"
import { formatEther } from "viem"

import { truncateAddress } from "@/lib/utils"
import { fundWallet } from "@/lib/web3"
import { useTokenPrice } from "@/hooks/use-token-price"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import ExportWalletDialog from "./export-wallet"
import { Skeleton } from "./ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

export default function WalletCard() {
  const { ethPrice } = useTokenPrice()
  const { state } = useWallets()
  const { selectedWallet, selectedAccount } = state
  const [usdAmount, setUsdAmount] = useState<number | undefined>(undefined)

  const handleFundWallet = async () => {
    if (!selectedAccount?.address) return
    await fundWallet(selectedAccount?.address, "0.005")
  }

  const handleCopyAddress = () => {
    if (selectedAccount?.address) {
      navigator.clipboard.writeText(selectedAccount.address)
      toast.success("Address copied to clipboard")
    }
  }

  const handleExportWallet = () => {}

  useEffect(() => {
    if (ethPrice && selectedAccount?.balance !== undefined) {
      const balanceInEther = formatEther(selectedAccount?.balance)
      setUsdAmount(ethPrice * Number(balanceInEther))
    }
  }, [ethPrice, selectedAccount?.balance])

  return (
    <Card className="w-[300px]  ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {selectedWallet?.walletName || (
            <Skeleton className="h-4 w-20 bg-muted-foreground/50" />
          )}
        </CardTitle>

        <ExportWalletDialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={handleExportWallet}
          >
            <Upload className="h-4 w-4" />{" "}
          </Button>
        </ExportWalletDialog>
      </CardHeader>
      <CardContent>
        <div className="text-xs ">
          {selectedAccount?.address ? (
            <>
              {truncateAddress(selectedAccount?.address)}
              <CopyIcon className="h-4 w-4" />
            </>
          ) : (
            <Skeleton className="h-3 w-32  rounded-sm bg-muted-foreground/50" />
          )}
        </div>
        <div className="text-4xl font-bold">
          ${usdAmount?.toFixed(2) || "0.00"}
          <span className="text-sm text-muted-foreground">USD</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedAccount?.balance
            ? Number(formatEther(selectedAccount?.balance)).toFixed(8)
            : "0"}{" "}
          ETH
        </div>
        <Button
          onClick={handleFundWallet}
          variant="link"
          className="mt-2 h-min cursor-pointer p-0 text-sm text-muted-foreground"
        >
          <HandCoins className="mr-2 h-4 w-4" />
          Fund wallet
        </Button>
      </CardContent>
    </Card>
  )
}
