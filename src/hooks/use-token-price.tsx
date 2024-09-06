import { useContext, useEffect, useState } from "react"
import { getTokenPrice as fetchTokenPrice } from "@/actions/web3"
import { TurnkeyContext } from "@/providers/turnkey-provider"

export const useTokenPrice = () => {
  const [ethPrice, setEthPrice] = useState<number | undefined>(undefined)

  useEffect(() => {
    const fetchEthPrice = async () => {
      const response = await fetchTokenPrice("ethereum")
      const data = await response.json()
      setEthPrice(data.ethereum.usd)
    }
    fetchEthPrice()
  }, [])

  return { getTokenPrice: fetchTokenPrice, ethPrice }
}
