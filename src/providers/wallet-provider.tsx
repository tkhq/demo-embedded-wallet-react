"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react"
import {
  DEFAULT_ETHEREUM_ACCOUNTS,
  defaultEthereumAccountAtIndex,
  TurnkeyBrowserClient,
} from "@turnkey/sdk-browser"
import { useTurnkey } from "@turnkey/sdk-react"
import { getAddress } from "viem"

import { Account, Wallet } from "@/types/turnkey"
import { getBalance, getPublicClient } from "@/lib/web3"

interface WalletsState {
  loading: boolean
  error: string
  wallets: Wallet[]
  selectedWallet: Wallet | null
  selectedAccount: Account | null
}

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_WALLETS"; payload: Wallet[] }
  | { type: "SET_SELECTED_WALLET"; payload: Wallet }
  | { type: "SET_SELECTED_ACCOUNT"; payload: Account }

const WalletsContext = createContext<
  | {
      state: WalletsState
      dispatch: React.Dispatch<Action>
      newWallet: (walletName?: string) => Promise<void>
      newWalletAccount: () => Promise<void>
      selectWallet: (wallet: Wallet) => void
      selectAccount: (account: Account) => void
    }
  | undefined
>(undefined)

function walletsReducer(state: WalletsState, action: Action): WalletsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_WALLETS":
      return { ...state, wallets: action.payload }
    case "SET_SELECTED_WALLET":
      return { ...state, selectedWallet: action.payload }
    case "SET_SELECTED_ACCOUNT":
      return { ...state, selectedAccount: action.payload }
    default:
      return state
  }
}

const initialState: WalletsState = {
  loading: false,
  error: "",
  wallets: [],
  selectedWallet: null,
  selectedAccount: null,
}

async function getWalletsWithAccounts(
  browserClient: TurnkeyBrowserClient
): Promise<Wallet[]> {
  const publicClient = getPublicClient()
  const { wallets } = await browserClient.getWallets()
  return await Promise.all(
    wallets.map(async (wallet) => {
      const { accounts } = await browserClient.getWalletAccounts({
        walletId: wallet.walletId,
      })
      const accountsWithBalance = await Promise.all(
        accounts.map(async ({ address, ...account }) => {
          const _address = getAddress(address)
          const balance = await getBalance(_address)

          return { ...account, address: _address, balance }
        })
      )
      return { ...wallet, accounts: accountsWithBalance }
    })
  )
}

// @todo - add an updateWallets function that will be called when the user
// updates their wallet settings, such as adding a new account or updating
// the wallet name
export function WalletsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walletsReducer, initialState)
  const { getActiveClient, passkeyClient, turnkey } = useTurnkey()

  useEffect(() => {
    // @todo - ensure that we don't fetch wallets more than once
    // This should only run at initial page load
    const fetchWallets = async () => {
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        const browserClient = await turnkey?.currentUserSession()
        if (browserClient) {
          const wallets = await getWalletsWithAccounts(browserClient)
          dispatch({ type: "SET_WALLETS", payload: wallets })
          if (wallets.length > 0) {
            dispatch({ type: "SET_SELECTED_WALLET", payload: wallets[0] })
            dispatch({
              type: "SET_SELECTED_ACCOUNT",
              payload: wallets[0].accounts[0],
            })
          }
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to fetch wallets" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }
    fetchWallets()
  }, [getActiveClient])

  useEffect(() => {
    if (state.selectedWallet) {
      dispatch({
        type: "SET_SELECTED_ACCOUNT",
        payload: state.selectedWallet.accounts[0],
      })
    }
  }, [state.selectedWallet])

  const newWalletAccount = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const browserClient = await turnkey?.currentUserSession()
      if (passkeyClient && state.selectedWallet && browserClient) {
        const newAccount = defaultEthereumAccountAtIndex(
          state.selectedWallet.accounts.length
        )

        const response = await passkeyClient.createWalletAccounts({
          walletId: state.selectedWallet.walletId,
          accounts: [newAccount],
        })

        if (response) {
          // @todo - instead of fetching all wallets, we should add the new wallet account to the existing list
          const wallets = await getWalletsWithAccounts(browserClient)
          dispatch({ type: "SET_WALLETS", payload: wallets })
          if (wallets.length > 0) {
            dispatch({ type: "SET_SELECTED_WALLET", payload: wallets[0] })
          }
        }
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to create new wallet account",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const newWallet = async (walletName?: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const browserClient = await turnkey?.currentUserSession()
      if (passkeyClient && browserClient) {
        const { walletId } = await passkeyClient.createWallet({
          walletName: walletName || "New Wallet",
          accounts: DEFAULT_ETHEREUM_ACCOUNTS,
        })

        if (walletId) {
          // @todo - instead of fetching all wallets, we should add the new wallet account to the existing list
          const wallets = await getWalletsWithAccounts(browserClient)
          dispatch({ type: "SET_WALLETS", payload: wallets })
          if (wallets.length > 0) {
            dispatch({ type: "SET_SELECTED_WALLET", payload: wallets[0] })
            dispatch({
              type: "SET_SELECTED_ACCOUNT",
              payload: wallets[0].accounts[0],
            })
          }
        }
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to create new wallet" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const selectWallet = (wallet: Wallet) => {
    dispatch({ type: "SET_SELECTED_WALLET", payload: wallet })
  }

  const selectAccount = (account: Account) => {
    dispatch({ type: "SET_SELECTED_ACCOUNT", payload: account })
  }

  const value = {
    state,
    dispatch,
    newWallet,
    newWalletAccount,
    selectWallet,
    selectAccount,
  }

  return (
    <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>
  )
}

export function useWallets() {
  const context = useContext(WalletsContext)
  if (context === undefined) {
    throw new Error("useWallets must be used within a WalletsProvider")
  }
  return context
}

export { WalletsContext }
