import React from "react"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DialogTrigger } from "./ui/dialog"

type TransferAction = "send" | "receive"

interface TransferMenuProps {
  onSelect: (action: TransferAction) => void
}

export default function TransferMenu({ onSelect }: TransferMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Transfer
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" w-64">
        <DropdownMenuItem onClick={() => onSelect("send")}>
          <ArrowUpIcon className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>Send crypto</span>
            <span className="text-sm text-muted-foreground">
              To a crypto address, email, or phone number
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onSelect("receive")}>
          <ArrowDownIcon className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>Receive crypto</span>
            <span className="text-sm text-muted-foreground">
              From another crypto wallet
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
