import { ArrowLeft, Info } from "lucide-react"
import { formatEther, type TransactionRequest } from "viem"

import { truncateAddress } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SendTransactionProps {
  transaction: TransactionRequest
  amountUSD: string
  ethPrice: number
  network: string
  onSend: (transaction: TransactionRequest) => void
  onBack: () => void
}

export default function SendTransaction({
  transaction,
  amountUSD,
  ethPrice,
  network,
  onSend,
  onBack,
}: SendTransactionProps) {
  const handleSend = () => {
    onSend(transaction)
  }

  const totalGasFees =
    transaction?.gas && transaction?.maxFeePerGas
      ? transaction.gas * transaction.maxFeePerGas
      : BigInt(0)

  const totalGasFeesUSD = parseFloat(formatEther(totalGasFees)) * ethPrice
  const totalUSD = parseFloat(amountUSD) + totalGasFeesUSD
  console.log({ totalGasFeesUSD, totalGasFees, totalUSD })
  return (
    <div className="">
      <div className="mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>
      {/* 
      <div className="mb-4 flex items-center justify-center">
        <div className="mr-2 rounded-full bg-blue-500 p-3">
          <DollarSign className="h-6 w-6" />
        </div>
        <div className="rounded-full bg-gray-800 p-3">
          <span className="font-bold">C</span>
        </div>
      </div> */}

      <h1 className="mb-1 text-center text-2xl font-bold">
        Send ${amountUSD} in ETH
      </h1>
      <p className="mb-6 text-center text-gray-400">
        {transaction.value ? formatEther(transaction.value) : "0"} ETH
      </p>

      <div className="mb-6 space-y-4">
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">Send to</span>
          <span className="text-right">
            {transaction.to ? truncateAddress(transaction.to) : "0x"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">Network</span>
          <span>{network}</span>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-medium text-muted-foreground">Total</span>
          <span className="text-sm text-muted-foreground/70">
            incl. ~${totalGasFeesUSD.toFixed(2)} network fee
          </span>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold">${totalUSD.toFixed(2)}</span>
          <br />
        </div>
      </div>

      <Button
        className="w-full rounded-lg bg-blue-500 py-3 text-white hover:bg-blue-600"
        onClick={handleSend}
      >
        Send now
      </Button>
    </div>
  )
}
