import { ModeToggle } from "@/components/mode-toggle"

import Account from "./account"
import { Icons } from "./icons"
import TransferDialog from "./transfer-dialog"

export default function NavMenu() {
  return (
    <div className="flex h-[5rem] items-center justify-between gap-4 bg-black px-10 py-4">
      <Icons.turnkey className="h-7 w-auto  fill-white stroke-none" />
      <div className="flex items-center justify-center gap-4">
        <TransferDialog />
        <Account />
        {/* <ModeToggle /> */}
      </div>
    </div>
  )
}
