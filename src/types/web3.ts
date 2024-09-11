import { Address } from "viem"

export interface Transaction {
  hash: string
  blockNumber: number
  value: number | null
  from: Address
  to: Address | null
  status: "pending" | "failed" | "received" | "sent"
  timestamp: string
}
