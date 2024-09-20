import { Key, MoreVertical } from "lucide-react"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface PasskeyItemProps {
  name: string
  createdAt: Date
  onEdit: () => void
  onRemove: () => void
  isRemovable: boolean
}

export function PasskeyItem({
  name,
  createdAt,
  onEdit,
  onRemove,
  isRemovable,
}: PasskeyItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Key className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-card-foreground">{name}</h3>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          Created at{" "}
          {createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={onRemove}
              disabled={!isRemovable}
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
