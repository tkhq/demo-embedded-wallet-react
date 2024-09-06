import { useContext, useEffect, useState } from "react"
import { TurnkeyContext } from "@/providers/turnkey-provider"
import {
  DEFAULT_ETHEREUM_ACCOUNTS,
  defaultEthereumAccountAtIndex,
  type TurnkeyBrowserClient,
} from "@turnkey/sdk-browser"
import { getAddress } from "viem"

import { Account, Wallet } from "@/types/turnkey"
import { getBrowserClient, getPassKeyClient } from "@/lib/turnkey"
import { publicClient } from "@/lib/web3"

const getWalletsWithAccounts = async (browserClient: TurnkeyBrowserClient) => {
  const { wallets } = await browserClient.getWallets()
  return await Promise.all(
    wallets.map(async (wallet) => {
      const { accounts } = await browserClient.getWalletAccounts({
        walletId: wallet.walletId,
      })
      const accountsWithBalance = await Promise.all(
        accounts.map(async ({ address, ...account }) => {
          const balance = await publicClient.getBalance({
            address: getAddress(address),
          })
          return { ...account, address: getAddress(address), balance }
        })
      )
      return { ...wallet, accounts: accountsWithBalance }
    })
  )
}

/**
 * Fetches wallets and their associated accounts using the Turnkey Browser Client.
 * Provides functionality to create new wallets and accounts.
 *
 * @returns {Object} - An object containing:
 *  - wallets: Array of Wallet objects with their accounts and balances.
 *  - newWallet: Function to create a new wallet.
 *  - selectedWallet: The currently selected wallet.
 *  - setSelectedWallet: Function to set the selected wallet.
 *  - selectedAccount: The currently selected account.
 *  - setSelectedAccount: Function to set the selected account.
 *  - newWalletAccount: Function to create a new account in the selected wallet.
 */
export const useWallets = () => {
  // Use Turnkey Browser Client to make read-only requests such as fetching wallets and accounts
  const { client: browserClient } = useContext(TurnkeyContext)

  // Use Turnkey Passkey Client to make authenticated write requests such as creating wallets and accounts

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  useEffect(() => {
    const fetchWallets = async () => {
      const browserClient = await getBrowserClient()
      console.log("fetchWallets", browserClient)
      if (browserClient) {
        console.log("fetchWallets 2")
        const wallets = await getWalletsWithAccounts(browserClient)

        setWallets(wallets)
        if (wallets.length > 0) {
          setSelectedWallet(wallets[0])
          setSelectedAccount(wallets[0].accounts[0])
        }
      }
    }
    fetchWallets()
  }, [browserClient])

  // When a wallet is selected, set the selected account to the first account in the wallet
  useEffect(() => {
    if (selectedWallet) {
      setSelectedAccount(selectedWallet.accounts[0])
    }
  }, [selectedWallet])

  const newWalletAccount = async () => {
    const passkeyClient = await getPassKeyClient()
    if (passkeyClient && selectedWallet && browserClient) {
      const newAccount = defaultEthereumAccountAtIndex(
        selectedWallet.accounts.length
      )

      const response = await passkeyClient.createWalletAccounts({
        walletId: selectedWallet.walletId,
        accounts: [newAccount],
      })

      // If the account creation is successful,
      // fetch the updated wallets and set the selected wallet to the first wallet
      if (response) {
        const wallets = await getWalletsWithAccounts(browserClient)
        setWallets(wallets)
        if (wallets.length > 0) {
          setSelectedWallet(wallets[0])
        }
      }
    }
  }

  const newWallet = async (walletName?: string) => {
    const passkeyClient = await getPassKeyClient()
    if (passkeyClient && browserClient) {
      const { walletId } = await passkeyClient.createWallet({
        walletName: walletName || "New Wallet",
        accounts: DEFAULT_ETHEREUM_ACCOUNTS,
      })

      if (walletId) {
        const wallets = await getWalletsWithAccounts(browserClient)
        setWallets(wallets)
        if (wallets.length > 0) {
          setSelectedWallet(wallets[0])
          setSelectedAccount(wallets[0].accounts[0])
        }
      }
    }
  }

  return {
    wallets,
    newWallet,
    selectedWallet,
    setSelectedWallet,
    selectedAccount,
    setSelectedAccount,
    newWalletAccount,
  }
}
