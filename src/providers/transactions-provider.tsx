"use client"

import React, { createContext, useContext, useEffect, useReducer } from "react"
import { useWallets } from "@/providers/wallet-provider"
import { Address } from "viem"

import { Transaction } from "@/types/web3"
import { getTransactions } from "@/lib/web3"

type TransactionsState = {
  transactions: { [key: Address]: Transaction[] }
  loading: boolean
  error: string | null
}

type TransactionsAction =
  | {
      type: "SET_TRANSACTIONS"
      payload: { address: Address; transactions: Transaction[] }
    }
  | { type: "SET_FETCHING_TRANSACTIONS" }
  | { type: "SET_ERROR"; payload: string }

type TransactionsContextType = TransactionsState & {
  dispatch: React.Dispatch<TransactionsAction>
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
)

const initialState: TransactionsState = {
  transactions: {},
  loading: false,
  error: null,
}

function transactionsReducer(
  state: TransactionsState,
  action: TransactionsAction
): TransactionsState {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload.address]: action.payload.transactions,
        },
        loading: false,
        error: null,
      }
    case "SET_FETCHING_TRANSACTIONS":
      return {
        ...state,
        loading: true,
        error: null,
      }
    case "SET_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    state: { selectedAccount },
  } = useWallets()
  const [state, dispatch] = useReducer(transactionsReducer, initialState)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (selectedAccount?.address) {
        dispatch({ type: "SET_FETCHING_TRANSACTIONS" })
        try {
          const transactions = await getTransactions(selectedAccount.address)
          console.log("txs", transactions)
          dispatch({
            type: "SET_TRANSACTIONS",
            payload: {
              address: selectedAccount.address,
              transactions,
            },
          })
        } catch (error) {
          dispatch({
            type: "SET_ERROR",
            payload: "Failed to fetch transactions",
          })
        }
      }
    }

    fetchTransactions()
  }, [selectedAccount?.address])

  return (
    <TransactionsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export const useTransactions = () => {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    )
  }
  return context
}
