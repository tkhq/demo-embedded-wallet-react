"use server"

import { Alchemy, Network } from "alchemy-sdk"
import { Address, createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"

import { env } from "@/env.mjs"

const settings = {
  apiKey: env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
}

const alchemy = new Alchemy(settings)

export const getTokenBalance = async (address: Address) => {
  const tokenBalances = await alchemy.core.getTokenBalances(address)
  return tokenBalances
}

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

export const getBalance = async (address: Address) => {
  const balance = await publicClient.getBalance({ address })
  return balance
}

export const getTokenPrice = async (token: string) => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
  const tokenResponse = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": env.COINGECKO_API_KEY,
    },
  })
  return tokenResponse
}
