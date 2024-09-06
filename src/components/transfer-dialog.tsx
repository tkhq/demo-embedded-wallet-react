"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDown,
  ChevronRight,
  Copy,
  Info,
} from "lucide-react"
import QRCode from "react-qr-code"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import TransferMenu from "./transfer-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ValueInput } from "./value-input"

type TransferAction = "send" | "receive"

export default function TransferDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<TransferAction>("send")
  const [amount, setAmount] = useState("")
  const [fontSize, setFontSize] = useState(70)
  const inputRef = useRef<HTMLInputElement>(null)
  const ethereumAddress = "0xbCdD2bBa5E2Cf199488Bd166b5Fdeee980Fd2498"
  const ethToUsd = 2000 // Example exchange rate
  const [ethAmount, setEthAmount] = useState("")

  useEffect(() => {
    if (inputRef.current) {
      const length = inputRef.current.value.length
      const newSize = Math.max(30, 70 - length * 2)
      setFontSize(newSize)
    }
  }, [amount])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setAmount(value)
  }

  const handleSelect = (action: TransferAction) => {
    setSelectedAction(action)
    setIsOpen(true)
  }

  const SendTab = () => {
    const spanRef = useRef<HTMLSpanElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (spanRef.current && inputRef.current) {
        const width = spanRef.current.offsetWidth + 14
        inputRef.current.style.width = `${width}px`
      }
    }, [ethAmount])

    return (
      <>
        <div className="relative mb-2 flex items-baseline text-7xl font-light">
          {/* <span
            ref={spanRef}
            className="invisible absolute whitespace-pre"
            style={{ fontSize: "4.5rem", lineHeight: 1 }}
          >
            {ethAmount || "0"}
          </span> */}
          {/* <Input
            ref={inputRef}
            type="text"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            className="w-[1ch] max-w-full border-none bg-transparent p-0 text-7xl font-light focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ fontSize: "4.5rem", lineHeight: 1, caretColor: "#0a84ff" }}
          /> */}
          <ValueInput
            value={ethAmount}
            onValueChange={setEthAmount}
            className="text-7xl"
            label="ETH"
          />
        </div>

        <div className="mb-6 text-lg  text-muted-foreground">
          ${parseFloat(ethAmount || "0") * 1800}.00
        </div>

        <div className="mb-4 flex items-center rounded-lg  p-4">
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#627eea]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 32 32"
            >
              <g fill="none" fillRule="evenodd">
                <circle cx="16" cy="16" r="16" fill="#627EEA" />
                <g fill="#FFF" fillRule="nonzero">
                  <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
                  <path d="M16.498 4L9 16.22l7.498-3.35z" />
                  <path
                    fillOpacity=".602"
                    d="M16.498 21.968v6.027L24 17.616z"
                  />
                  <path d="M16.498 27.995v-6.028L9 17.616z" />
                  <path
                    fillOpacity=".2"
                    d="M16.498 20.573l7.497-4.353-7.497-3.348z"
                  />
                  <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
                </g>
              </g>
            </svg>
          </div>
          <div className="flex-grow">
            <div className="font-semibold">Send</div>
            <div className="text-sm ">Ethereum</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">0.0034949 ETH</div>
            <div className="text-sm ">Balance</div>
          </div>
          <ChevronRight className="ml-2 " size={20} />
        </div>

        <div className="mb-6 flex items-center rounded-lg bg-muted  p-4">
          <Input
            placeholder="Enter recipient address"
            className="flex-grow border-none bg-transparent  placeholder-[#8e8e93] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <Button className="w-full   ">
          Preview Send
          <ChevronRight className="ml-2" size={20} />
        </Button>
      </>
    )
  }

  const ReceiveTab = () => (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Ethereum</h2>
          <p className="text-[#8e8e93]">ETH wallet</p>
        </div>
        <Button variant="ghost" className="text-white">
          <ChevronDown className="mr-2" size={20} />
        </Button>
      </div>

      <div className="mx-auto mb-4 w-8/12 rounded-lg p-4 dark:bg-white">
        <QRCode
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={ethereumAddress}
        />
      </div>

      <div className="mb-4">
        <h3 className="mb-2">ETH address (Ethereum)</h3>
        <div className="flex items-center justify-between rounded-lg  p-4">
          <div className="break-all text-sm">{ethereumAddress}</div>
          <Button variant="ghost" className="text-[#0a84ff]">
            <Copy size={20} />
          </Button>
        </div>
      </div>

      {/* <div className="flex items-start rounded-lg bg-[#2c2c2e] p-4">
        <Info className="mr-2 mt-1 shrink-0 text-[#0a84ff]" size={20} />
        <p className="text-sm">
          This address can only receive Ethereum from Ethereum network. Don't
          send ETH from other networks, any ERC-20s or NFTs, or it may result in
          a loss of funds.
        </p>
      </div> */}
    </>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="dark flex items-center justify-center gap-4">
        <Button
          onClick={() => handleSelect("send")}
          variant="outline"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Send
        </Button>
        <Button
          onClick={() => handleSelect("receive")}
          variant="outline"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Receive
        </Button>
      </div>
      <DialogContent className=" p-4  sm:max-w-[425px]">
        <Card className="w-full border-0  ">
          <CardContent className="p-6">
            <Tabs defaultValue={selectedAction} className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2 ">
                <TabsTrigger value="send">Send</TabsTrigger>
                <TabsTrigger value="receive">Receive</TabsTrigger>
              </TabsList>
              <TabsContent value="send">
                <SendTab />
              </TabsContent>
              <TabsContent value="receive">
                <ReceiveTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
