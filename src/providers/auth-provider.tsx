"use client"

import { createContext, ReactNode, useContext, useReducer } from "react"
import { useRouter } from "next/navigation"
import {
  createUserSubOrg,
  getSubOrgIdByEmail,
  initEmailAuth,
} from "@/actions/turnkey"

import { Email, User } from "@/types/turnkey"
import { getIFrameClient, getPassKeyClient } from "@/lib/turnkey"

export const loginResponseToUser = (loginResponse: {
  organizationId: string
  organizationName: string
  userId: string
  username: string
  session: string
  sessionExpiry: string
}): User => {
  const subOrganization = {
    organizationId: loginResponse.organizationId,
    organizationName: loginResponse.organizationName,
  }

  const readOnlySession = {
    session: loginResponse.session,
    sessionExpiry: Number(loginResponse.sessionExpiry),
  }

  return {
    userId: loginResponse.userId,
    username: loginResponse.username,
    organization: subOrganization,
    readOnlySession: readOnlySession,
  }
}

type AuthActionType =
  | { type: "PASSKEY"; payload: User }
  | { type: "INIT_EMAIL_AUTH" }
  | { type: "COMPLETE_EMAIL_AUTH"; payload: User }
  | { type: "EMAIL_RECOVERY"; payload: User }
  | { type: "WALLET_AUTH"; payload: User }
  | { type: "OAUTH"; payload: User }
  | { type: "LOADING"; payload: boolean }
  | { type: "ERROR"; payload: string }

interface AuthState {
  loading: boolean
  error: string
  user: User | null
}

const initialState: AuthState = {
  loading: false,
  error: "",
  user: null,
}

function authReducer(state: AuthState, action: AuthActionType): AuthState {
  console.log("authReducer", action, state)
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: action.payload }
    case "ERROR":
      return { ...state, error: action.payload, loading: false }
    case "INIT_EMAIL_AUTH":
      return { ...state, loading: false, error: "" }
    case "COMPLETE_EMAIL_AUTH":
      return { ...state, user: action.payload, loading: false, error: "" }
    case "PASSKEY":
    case "EMAIL_RECOVERY":
    case "WALLET_AUTH":
    case "OAUTH":
      return { ...state, user: action.payload, loading: false, error: "" }
    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  initEmailLogin: (email: Email) => Promise<void>
  completeEmailAuth: (params: {
    userEmail: string
    continueWith: string
    credentialBundle: string
  }) => Promise<void>
  loginWithPasskey: (email: Email) => Promise<void>
}>({
  state: initialState,
  initEmailLogin: async () => {},
  completeEmailAuth: async () => {},
  loginWithPasskey: async () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()

  const initEmailLogin = async (email: Email) => {
    const iframeClient = await getIFrameClient()
    dispatch({ type: "LOADING", payload: true })
    try {
      const response = await initEmailAuth({
        email,
        targetPublicKey: `${iframeClient?.iframePublicKey}`,
      })
      console.log("response", response)
      if (response) {
        dispatch({ type: "INIT_EMAIL_AUTH" })
        router.push(`/email-auth?userEmail=${email}`)
        // Email sent successfully
      }
    } catch (error: any) {
      dispatch({ type: "ERROR", payload: error.message })
    } finally {
      dispatch({ type: "LOADING", payload: false })
    }
  }

  const completeEmailAuth = async ({
    userEmail,
    continueWith,
    credentialBundle,
  }: {
    userEmail: string
    continueWith: string
    credentialBundle: string
  }) => {
    const iframeClient = await getIFrameClient()

    if (userEmail && continueWith === "email" && credentialBundle) {
      dispatch({ type: "LOADING", payload: true })

      try {
        await iframeClient?.injectCredentialBundle(credentialBundle)
        const loginResponse = await iframeClient?.login()
        console.log("loginResponse", loginResponse)
        if (loginResponse?.organizationId) {
          dispatch({
            type: "COMPLETE_EMAIL_AUTH",
            payload: loginResponseToUser(loginResponse),
          })
          router.push("/dashboard")
        }
      } catch (error: any) {
        dispatch({ type: "ERROR", payload: error.message })
      } finally {
        dispatch({ type: "LOADING", payload: false })
      }
    }
  }

  const loginWithPasskey = async (email: Email) => {
    dispatch({ type: "LOADING", payload: true })
    try {
      const passkeyClient = await getPassKeyClient()
      // Determine if the user has a sub-organization associated with their email
      const subOrgId = await getSubOrgIdByEmail(email as Email)
      if (subOrgId?.length) {
        const loginResponse = await passkeyClient?.login()
        if (loginResponse?.organizationId) {
          dispatch({
            type: "PASSKEY",
            payload: loginResponseToUser(loginResponse),
          })
          router.push("/dashboard")
        }
      } else {
        // User either does not have an account with a sub organization
        // or does not have a passkey
        // Create a new passkey for the user
        const { encodedChallenge, attestation } =
          (await passkeyClient?.createUserPasskey({
            publicKey: {
              user: {
                name: email,
                displayName: email,
              },
            },
          })) || {}

        // Create a new sub organization for the user
        if (encodedChallenge && attestation) {
          const res = await createUserSubOrg({
            email: email as Email,
            challenge: encodedChallenge,
            attestation,
          })
        }
      }
    } catch (error: any) {
      dispatch({ type: "ERROR", payload: error.message })
    } finally {
      dispatch({ type: "LOADING", payload: false })
    }
  }

  return (
    <AuthContext.Provider
      value={{ state, initEmailLogin, completeEmailAuth, loginWithPasskey }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext)