"use client"

import React, { useEffect, useRef, useState } from "react"
import { useWallets } from "@/providers/wallet-provider"
import { useTurnkey } from "@turnkey/sdk-react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDown,
  ChevronRight,
  Copy,
  Info,
} from "lucide-react"
import QRCode from "react-qr-code"
import {
  formatEther,
  getAddress,
  parseEther,
  TransactionRequest,
  WalletClient,
} from "viem"
import { sepolia } from "viem/chains"

import { showTransactionToast } from "@/lib/toast"
import { getPublicClient, getTurnkeyWalletClient } from "@/lib/web3"
import { useTokenPrice } from "@/hooks/use-token-price"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import SendTransaction from "./send-transaction"
import { ValueInput } from "./value-input"

type TransferAction = "send" | "receive"

export default function TransferDialog() {
  const { state } = useWallets()
  const { selectedAccount } = state
  const { ethPrice } = useTokenPrice()
  const { getActiveClient } = useTurnkey()

  // Controls the dialog open/close state
  const [isOpen, setIsOpen] = useState(false)

  // Controls the tab selection: send or receive
  const [selectedAction, setSelectedAction] = useState<TransferAction>("send")

  // The amount of ETH to send
  const [ethAmount, setEthAmount] = useState("")

  // Controls the current view: send, receive, or send transaction
  const [currentView, setCurrentView] = useState<
    "send" | "receive" | "sendTransaction"
  >("send")

  // Controls the amount in USD
  const [amountUSD, setAmountUSD] = useState("0")

  // The recipient address to send to, defaults to the Turnkey HQ Faucet
  const [recipientAddress, setRecipientAddress] = useState(
    "0xE7F48E6dCfBeA43ff5CD1F1570f6543878cCF156"
  )

  const [transactionRequest, setTransactionRequest] =
    useState<TransactionRequest | null>(null)

  const [walletClient, setWalletClient] = useState<Awaited<
    ReturnType<typeof getTurnkeyWalletClient>
  > | null>(null)

  useEffect(() => {
    const initializeWalletClient = async () => {
      if (!selectedAccount) return
      const turnkeyClient = await getActiveClient()
      if (!turnkeyClient) return

      const client = await getTurnkeyWalletClient(
        turnkeyClient,
        selectedAccount.address
      )
      setWalletClient(client)
    }

    initializeWalletClient()
  }, [selectedAccount, getActiveClient])

  useEffect(() => {
    const ethAmountParsed = parseFloat(ethAmount || "0")
    console.log(ethAmountParsed)
    if (!isNaN(ethAmountParsed) && ethPrice) {
      const ethPriceParsed = parseFloat(ethPrice.toFixed(2))
      console.log(ethPriceParsed)
      setAmountUSD((ethAmountParsed * ethPriceParsed).toFixed(2))
    }
  }, [ethAmount, ethPrice])

  const handleSelect = (action: TransferAction) => {
    setSelectedAction(action)
    setIsOpen(true)
  }

  const handlePreviewSendTransaction = async () => {
    if (!selectedAccount || !walletClient) return
    // Prepare the transaction request to calculate the gas fees
    const transaction = await walletClient.prepareTransactionRequest({
      to: getAddress(recipientAddress),
      value: parseEther(ethAmount),
    })
    console.log({ transaction })
    setTransactionRequest(transaction)

    setCurrentView("sendTransaction")
  }

  // @todo: This could fit nicely inside of the transaction provider
  const handleSendTransaction = async (
    transactionRequest: TransactionRequest
  ) => {
    if (!selectedAccount || !walletClient) return
    try {
      const publicClient = getPublicClient()
      setIsOpen(false)
      const hash = await walletClient.sendTransaction(transactionRequest)
      const toastId = showTransactionToast({
        hash,
        title: "Sending transaction...",
        description: "View your transaction on explorer",
        type: "loading",
      })
      await publicClient.waitForTransactionReceipt({
        hash,
      })
      showTransactionToast({
        id: toastId,
        hash,
        title: "Transaction sent! 🎉",
        description: `Transaction sent to ${recipientAddress}`,
        type: "success",
      })
    } catch (error) {
      console.error("Error sending transaction:", error)
      showTransactionToast({
        title: "Error sending transaction",
        description: "Please try again",
        type: "error",
      })
    }
  }

  const handleBackToSendTab = () => {
    setCurrentView("send")
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
          <ValueInput
            value={ethAmount}
            onValueChange={setEthAmount}
            className="text-7xl"
            label="ETH"
          />
        </div>

        <div className="mb-6 text-lg  text-muted-foreground">${amountUSD}</div>

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
            <div className="font-semibold">
              {selectedAccount?.balance
                ? formatEther(selectedAccount?.balance)
                : "0"}{" "}
              <span className="text-sm text-muted-foreground">ETH</span>
            </div>
            <div className="text-sm ">Balance</div>
          </div>
          {/* TODO: Could add this back such that when clicked it displays list of wallet accounts to send from */}
          {/* <ChevronRight className="ml-2 " size={20} /> */}
        </div>

        <div className="mb-6 flex items-center rounded-lg bg-muted  p-4">
          <Input
            placeholder="Enter recipient address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="flex-grow border-none bg-transparent  placeholder-[#8e8e93] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <Button
          disabled={!recipientAddress || !ethAmount}
          className="w-full"
          onClick={handlePreviewSendTransaction}
        >
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
          value={selectedAccount?.address || ""}
        />
      </div>

      <div className="mb-4">
        <h3 className="mb-2">ETH address (Ethereum)</h3>
        <div className="flex items-center justify-between rounded-lg  p-4">
          <div className="break-all text-sm">{selectedAccount?.address}</div>
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
      <DialogContent className="p-4 sm:max-w-[425px]">
        <DialogTitle className="sr-only">Transfer Dialog</DialogTitle>
        <Card className="w-full border-0  shadow-none">
          <CardContent className="p-6">
            {currentView === "send" && (
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
            )}
            {currentView === "sendTransaction" &&
              transactionRequest &&
              ethPrice && (
                <SendTransaction
                  transaction={transactionRequest}
                  amountUSD={amountUSD}
                  ethPrice={ethPrice}
                  network="Ethereum"
                  onSend={handleSendTransaction}
                  onBack={handleBackToSendTab}
                />
              )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
