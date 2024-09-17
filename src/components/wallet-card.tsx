"use client"

import { useEffect, useState } from "react"
import { useWallets } from "@/providers/wallet-provider"
import { CopyIcon, Download, HandCoins, Upload } from "lucide-react"
import { toast } from "sonner"
import { formatEther } from "viem"

import { truncateAddress } from "@/lib/utils"
import { fundWallet } from "@/lib/web3"
import { useTokenPrice } from "@/hooks/use-token-price"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import ExportWalletDialog from "./export-wallet"
import ImportWalletDialog from "./import-wallet"
import { Skeleton } from "./ui/skeleton"

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

  const handleImportWallet = () => {}

  useEffect(() => {
    if (ethPrice && selectedAccount?.balance !== undefined) {
      const balanceInEther = formatEther(selectedAccount?.balance)
      setUsdAmount(ethPrice * Number(balanceInEther))
    }
  }, [ethPrice, selectedAccount?.balance])

  return (
    // <Card className="w-[350px] bg-gradient-to-r from-[#3f3cff] to-[#ecb7d7] ">
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className=" font-medium">
          {selectedWallet?.walletName || (
            <Skeleton className="h-4 w-20 bg-muted-foreground/50" />
          )}
        </CardTitle>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleFundWallet}
            className="h-min cursor-pointer "
            // className="mt-2 h-min cursor-pointer bg-black/40 text-white "
          >
            <HandCoins className="mr-2 h-4 w-4" />
            Fund wallet
          </Button>
          <ExportWalletDialog>
            <Button variant="outline" onClick={handleExportWallet}>
              <Upload className="mr-2 h-4 w-4" /> Export
            </Button>
          </ExportWalletDialog>
          <ImportWalletDialog>
            <Button variant="outline" onClick={handleImportWallet}>
              <Download className="mr-2 h-4 w-4" />
              Import
            </Button>
          </ImportWalletDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-sm">
          {selectedAccount?.address ? (
            <div
              onClick={handleCopyAddress}
              className="flex cursor-pointer items-center gap-2"
            >
              {truncateAddress(selectedAccount?.address)}
              <CopyIcon className="h-3 w-3" />
            </div>
          ) : (
            <Skeleton className="h-3 w-32  rounded-sm bg-muted-foreground/50" />
          )}
        </div>
        <div className="text-4xl font-bold">
          ${usdAmount?.toFixed(2) || "0.00"}
          <span className="ml-1 text-sm text-muted-foreground">USD</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedAccount?.balance
            ? parseFloat(
                Number(formatEther(selectedAccount?.balance)).toFixed(8)
              ).toString()
            : "0"}{" "}
          ETH
        </div>
      </CardContent>
    </Card>
  )
}
