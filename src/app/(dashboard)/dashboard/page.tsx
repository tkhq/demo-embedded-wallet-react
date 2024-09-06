import { WrappedActivity } from "@/components/activity"
import Assets, { WrappedAssets } from "@/components/assets"
import TransferDialog from "@/components/transfer-dialog"
import WalletCard from "@/components/wallet-card"

export default function Dashboard() {
  return (
    <main className="flex items-center justify-center ">
      {/* <TransferDialog /> */}
      <div className="space-y-8 px-36 py-12">
        <WalletCard />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <WrappedAssets />
          </div>
          <div>
            <WrappedActivity />
          </div>
        </div>
      </div>
    </main>
  )
}
