"use client"

import { useEffect, useRef, useState } from "react"
import { useWallets } from "@/providers/wallet-provider"
import { TurnkeyIframeClient } from "@turnkey/sdk-browser"
import { useTurnkey } from "@turnkey/sdk-react"
import { Key, Loader, RectangleEllipsis } from "lucide-react"

import { turnkeyConfig } from "@/config/turnkey"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ExportWalletDialog({
  children,
}: {
  children: React.ReactNode
}) {
  const { state } = useWallets()
  const { selectedWallet, selectedAccount } = state
  const { turnkey, getActiveClient } = useTurnkey()
  const { export: exportConfig } = turnkeyConfig.iFrame
  const [iframeClient, setIframeClient] = useState<TurnkeyIframeClient | null>(
    null
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const iframeContainerRef = useRef<HTMLDivElement | null>(null)
  const [injectResponse, setInjectResponse] = useState(false)
  const [selectedExportType, setSelectedExportType] = useState("seed-phrase")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isDialogOpen) {
      // Create a MutationObserver to watch for changes in the DOM
      const observer = new MutationObserver(() => {
        // If the iframe container is found, initialize the iframe and stop observing
        if (iframeContainerRef.current) {
          initIframe()
          observer.disconnect()
        }
      })

      // If the iframe container is not yet available, start observing the DOM
      if (!iframeContainerRef.current) {
        observer.observe(document.body, { childList: true, subtree: true })
      }

      // Cleanup function to disconnect the observer when the dialog is closed
      return () => observer.disconnect()
    }
  }, [isDialogOpen])

  const initIframe = async () => {
    if (iframeContainerRef.current) {
      const iframeContainer = iframeContainerRef.current
      const exportIframeClient = await turnkey?.iframeClient({
        iframeContainer,
        iframeUrl: exportConfig.url,
      })
      if (exportIframeClient) {
        setIframeClient(exportIframeClient)
      }
    }
  }

  const exportWallet = async () => {
    if (injectResponse) {
      setIsDialogOpen(false)
      setInjectResponse(false)
    } else {
      if (iframeClient && selectedWallet) {
        if (selectedExportType === "seed-phrase") {
          await exportSeedPhrase()
        } else if (selectedExportType === "private-key") {
          await exportPrivateKey()
        }
      }
    }
    setLoading(false)
  }

  const exportSeedPhrase = async () => {
    if (iframeClient && selectedWallet) {
      try {
        const activeClient = await getActiveClient()
        setLoading(true)
        const exportResponse = await activeClient?.exportWallet({
          walletId: selectedWallet.walletId,
          targetPublicKey: `${iframeClient?.iframePublicKey}`,
        })

        if (exportResponse?.exportBundle) {
          const currentUser = await turnkey?.getCurrentUser()
          const response = await iframeClient?.injectWalletExportBundle(
            exportResponse.exportBundle,
            `${currentUser?.organization.organizationId}`
          )

          setInjectResponse(response)
        }
      } catch (error) {
        console.error("Export failed:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const exportPrivateKey = async () => {
    if (iframeClient && selectedAccount) {
      try {
        const activeClient = await getActiveClient()
        setLoading(true)
        const exportResponse = await activeClient?.exportWalletAccount({
          address: selectedAccount.address,
          targetPublicKey: `${iframeClient?.iframePublicKey}`,
        })
        if (exportResponse?.exportBundle) {
          const currentUser = await turnkey?.getCurrentUser()
          const response = await iframeClient?.injectKeyExportBundle(
            exportResponse.exportBundle,
            `${currentUser?.organization.organizationId}`
          )

          setInjectResponse(response)
        }
      } catch (error) {
        console.error("Export failed:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Wallet</DialogTitle>
          <DialogDescription>Select export type</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedExportType}
            onValueChange={setSelectedExportType}
            className="flex gap-4"
          >
            <div className="flex-1">
              <RadioGroupItem
                value="seed-phrase"
                id="seed-phrase"
                className="peer sr-only"
              />
              <Label
                htmlFor="seed-phrase"
                className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <RectangleEllipsis className="mb-2 h-6 w-6" />
                Seed Phrase
              </Label>
            </div>
            <div className="flex-1">
              <RadioGroupItem
                value="private-key"
                id="private-key"
                className="peer sr-only"
              />
              <Label
                htmlFor="private-key"
                className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Key className="mb-2 h-6 w-6" />
                Private Key
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div
          className={cn("w-full rounded-md bg-muted p-4", {
            hidden: !injectResponse,
          })}
        >
          <div ref={iframeContainerRef} className="h-1/2" />
        </div>
        <DialogFooter className="justify-center">
          <Button
            disabled={loading}
            onClick={exportWallet}
            type="submit"
            className="w-full"
          >
            {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Exporting..." : injectResponse ? "Done" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
