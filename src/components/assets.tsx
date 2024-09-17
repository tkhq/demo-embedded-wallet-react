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

import { Icons } from "./icons"

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
                  <Icons.ethereum className="h-6 w-6" />
                  <span>Ethereum (Sepolia)</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {selectedAccount?.address &&
                  truncateAddress(selectedAccount?.address)}
              </TableCell>
              <TableCell>
                {selectedAccount?.balance &&
                  parseFloat(
                    Number(formatEther(selectedAccount?.balance)).toFixed(8)
                  ).toString()}
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
