import { TransactionsProvider } from "@/providers/transactions-provider"

import Activity from "@/components/activity"
import Assets from "@/components/assets"
import WalletCard from "@/components/wallet-card"

export default function Dashboard() {
  return (
    <main className="container mx-auto space-y-4 p-8 lg:space-y-8 xl:px-12 2xl:px-24">
      <WalletCard />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
        <div className="xl:self-start">
          <Assets />
        </div>
        <TransactionsProvider>
          <Activity />
        </TransactionsProvider>
      </div>
    </main>
  )
}
