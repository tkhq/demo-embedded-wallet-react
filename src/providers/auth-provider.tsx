"use client"

import { createContext, ReactNode, useContext, useReducer } from "react"
import { useRouter } from "next/navigation"
import {
  createUserSubOrg,
  getSubOrgId,
  getSubOrgIdByEmail,
  initEmailAuth,
  oauth,
} from "@/actions/turnkey"
import { googleLogout } from "@react-oauth/google"
import { useTurnkey } from "@turnkey/sdk-react"

import { Email, User } from "@/types/turnkey"

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
  loginWithPasskey: (email?: Email) => Promise<void>
  loginWithOAuth: (credential: string) => Promise<void>
  logout: () => Promise<void>
}>({
  state: initialState,
  initEmailLogin: async () => {},
  completeEmailAuth: async () => {},
  loginWithPasskey: async () => {},
  loginWithOAuth: async () => {},
  logout: async () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()
  const { turnkey, authIframeClient, passkeyClient } = useTurnkey()

  const initEmailLogin = async (email: Email) => {
    dispatch({ type: "LOADING", payload: true })
    try {
      const response = await initEmailAuth({
        email,
        targetPublicKey: `${authIframeClient?.iframePublicKey}`,
      })

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
    if (userEmail && continueWith === "email" && credentialBundle) {
      dispatch({ type: "LOADING", payload: true })

      try {
        await authIframeClient?.injectCredentialBundle(credentialBundle)

        const loginResponse = await authIframeClient?.login()

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

  const loginWithPasskey = async (email?: Email) => {
    dispatch({ type: "LOADING", payload: true })
    try {
      let loginResponse

      if (email) {
        // Determine if the user has a sub-organization associated with their email
        const subOrgId = await getSubOrgIdByEmail(email as Email)

        if (subOrgId?.length) {
          loginResponse = await passkeyClient?.login()
        }
      } else {
        // If no email is provided, assume the user already has an account
        // Used for new sign ups when logging in for the first time
        loginResponse = await passkeyClient?.login()
      }

      if (loginResponse?.organizationId) {
        dispatch({
          type: "PASSKEY",
          payload: loginResponseToUser(loginResponse),
        })

        router.push("/dashboard")
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
          const { subOrg, user } = await createUserSubOrg({
            email: email as Email,
            passkey: {
              challenge: encodedChallenge,
              attestation,
            },
          })

          // New sub organization created, with passkey authenticator,
          // redirect to login page to login with passkey
          if (subOrg && user) {
            const org = {
              organizationId: subOrg.subOrganizationId,
              organizationName: "",
            }
            const currentUser: User = {
              userId: user.userId,
              username: user.userName,
              organization: org,
            }
            localStorage.setItem(
              "@turnkey/current_user",
              JSON.stringify(currentUser)
            )
            router.push("/dashboard")
          }
        }
      }
    } catch (error: any) {
      dispatch({ type: "ERROR", payload: error.message })
    } finally {
      dispatch({ type: "LOADING", payload: false })
    }
  }

  const loginWithOAuth = async (credential: string) => {
    dispatch({ type: "LOADING", payload: true })
    try {
      // Determine if the user has a sub-organization associated with their email
      let subOrgId = await getSubOrgId({ oidcToken: credential })

      if (!subOrgId) {
        // User does not have a sub-organization associated with their email
        // Create a new sub-organization for the user
        const { subOrg } = await createUserSubOrg({
          oauth: {
            credential,
          },
        })
        subOrgId = subOrg.subOrganizationId
      }

      const oauthResponse = await oauth({
        credential,
        targetPublicKey: `${authIframeClient?.iframePublicKey}`,
        targetSubOrgId: subOrgId,
      })
      const credentialResponse = await authIframeClient?.injectCredentialBundle(
        oauthResponse.credentialBundle
      )

      if (credentialResponse) {
        const loginResponse = await authIframeClient?.login()
        if (loginResponse?.organizationId) {
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      dispatch({ type: "ERROR", payload: error.message })
    } finally {
      dispatch({ type: "LOADING", payload: false })
    }
  }

  const logout = async () => {
    await turnkey?.logoutUser()
    googleLogout()
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        initEmailLogin,
        completeEmailAuth,
        loginWithPasskey,
        loginWithOAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
