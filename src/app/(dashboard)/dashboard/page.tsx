import { TransactionsProvider } from "@/providers/transactions-provider"

import Activity from "@/components/activity"
import Assets from "@/components/assets"
import WalletCard from "@/components/wallet-card"

export default function Dashboard() {
  return (
    <main className="flex items-center justify-center ">
      {/* <TransferDialog /> */}
      <div className="space-y-8 px-36 py-12">
        <WalletCard />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Assets />
          </div>
          <div>
            <TransactionsProvider>
              <Activity />
            </TransactionsProvider>
          </div>
        </div>
      </div>
    </main>
  )
}
