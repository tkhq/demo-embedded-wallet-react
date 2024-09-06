"use client"

import Image from "next/image"

import { truncateAddress } from "@/lib/utils"
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

export default function Assets({ assets }: AssetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My assets</CardTitle>
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
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {/* <Image
                      src={asset.logo}
                      alt={`${asset.name} logo`}
                      width={24}
                      height={24}
                      className="rounded-full"
                    /> */}
                    <Avatar className="h-full w-auto bg-muted  p-4">
                      <AvatarFallback className="bg-transparent text-base font-semibold"></AvatarFallback>
                    </Avatar>
                    <span>
                      {asset.name} ({asset.network})
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {truncateAddress(asset.address)}
                </TableCell>
                <TableCell>{asset.amount}</TableCell>
                <TableCell>${asset.valueUSD.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

type WrappedAssetsProps = {
  assets: Asset[]
}
const exampleAssets: Asset[] = [
  {
    id: "1",
    name: "Ethereum",
    network: "Sepolia",
    logo: "/placeholder.svg",
    address: "0xCE27c1D3E671754006746bDcf514F16a6a5C8aaD",
    amount: 0.005,
    valueUSD: 13.15,
  },
  {
    id: "2",
    name: "Bitcoin",
    network: "Testnet",
    logo: "/placeholder.svg",
    address: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
    amount: 0.01,
    valueUSD: 300.5,
  },
  {
    id: "3",
    name: "Cardano",
    network: "Testnet",
    logo: "/placeholder.svg",
    address: "addr_test1vz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3s9c3k9eqk8khuq",
    amount: 100,
    valueUSD: 45.75,
  },
]

export function WrappedAssets() {
  return (
    <div className="">
      <Assets assets={exampleAssets} />
    </div>
  )
}
