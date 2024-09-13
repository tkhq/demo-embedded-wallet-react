"use client"

import { useEffect, useRef, useState } from "react"
import { useWallets } from "@/providers/wallet-provider"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import type { Transaction } from "@/types/web3"
import { cn } from "@/lib/utils"
import { getTransactions, watchPendingTransactions } from "@/lib/web3"
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

import { ScrollArea } from "./ui/scroll-area"

export default function Activity() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const { ethPrice } = useTokenPrice()
  const { state } = useWallets()
  const { selectedAccount } = state
  const [tableHeight, setTableHeight] = useState<number | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (selectedAccount?.address) {
        const transactions = await getTransactions(selectedAccount?.address)
        setTransactions(transactions)
        // watchPendingTransactions(
        //   selectedAccount?.address,
        //   (tx: Transaction) => {
        //     console.log("pending tx", tx)
        //     // setTransactions((prev) => [...prev, tx])
        //   }
        // )
      }
    }
    fetchTransactions()
  }, [selectedAccount?.address])

  useEffect(() => {
    const updateTableHeight = () => {
      if (tableRef.current) {
        const height = tableRef.current.scrollHeight
        setTableHeight(Math.min(height, 450))
      }
    }

    updateTableHeight()
    window.addEventListener("resize", updateTableHeight)

    return () => {
      window.removeEventListener("resize", updateTableHeight)
    }
  }, [transactions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea
          className={cn(
            "w-full rounded-md",
            tableHeight ? `h-[${tableHeight}px]` : ""
          )}
          ref={tableRef}
        >
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.hash}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.status === "received" ? (
                          <ArrowDownIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowUpIcon className="h-4 w-4 text-red-500" />
                        )}
                        {transaction.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {transaction.from.slice(0, 6)}...
                      {transaction.from.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <div>{transaction.value || 0} ETH</div>
                      <div className="text-xs text-muted-foreground">
                        $
                        {transaction.value
                          ? (transaction.value * (ethPrice ?? 0)).toFixed(2)
                          : 0}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center" colSpan={4}>
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
