"use client"

import { useWallets } from "@/providers/wallet-provider"
import { formatEther } from "viem"

import { truncateAddress } from "@/lib/utils"
import { useTokenPrice } from "@/hooks/use-token-price"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Avatar, AvatarFallback } from "./ui/avatar"

type Asset = {
  id: string
  name: string
  network: string
  logo: string
  address: string
  amount: number
  valueUSD: number
}

type AssetsProps = {
  assets: Asset[]
}

export default function Assets() {
  const { state } = useWallets()
  const { ethPrice } = useTokenPrice()
  const { selectedAccount } = state
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Value (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-full w-auto bg-muted  p-4">
                    <AvatarFallback className="bg-transparent text-base font-semibold"></AvatarFallback>
                  </Avatar>
                  <span>Ethereum (Sepolia)</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {selectedAccount?.address &&
                  truncateAddress(selectedAccount?.address)}
              </TableCell>
              <TableCell>
                {selectedAccount?.balance &&
                  Number(formatEther(selectedAccount?.balance)).toFixed(6)}
              </TableCell>
              <TableCell>
                $
                {(
                  Number(formatEther(selectedAccount?.balance ?? BigInt(0))) *
                  (ethPrice || 0)
                ).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
