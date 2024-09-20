import { useEffect, useState } from "react"
import { getTokenPrice } from "@/actions/web3"

export const useTokenPrice = () => {
  const [ethPrice, setEthPrice] = useState<number | undefined>(undefined)

  useEffect(() => {
    const fetchEthPrice = async () => {
      const ethPrice = await getTokenPrice("ethereum")
      setEthPrice(ethPrice)
    }
    fetchEthPrice()
  }, [])

  return { getTokenPrice, ethPrice }
}
