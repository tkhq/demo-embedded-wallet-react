import { useContext, useEffect, useState } from "react"
import { getTokenPrice as fetchTokenPrice } from "@/actions/web3"
import { TurnkeyContext } from "@/providers/turnkey-provider"

export const useTokenPrice = () => {
  const { turnkey } = useContext(TurnkeyContext)
  const [ethPrice, setEthPrice] = useState<number | undefined>(undefined)

  useEffect(() => {
    const fetchEthPrice = async () => {
      if (turnkey) {
        const response = await fetchTokenPrice("ethereum")
        const data = await response.json()
        setEthPrice(data.ethereum.usd)
      }
    }
    fetchEthPrice()
  }, [turnkey])

  return { getTokenPrice: fetchTokenPrice, ethPrice }
}
