"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google"
import { useTurnkey } from "@turnkey/sdk-react"
import { sha256 } from "viem"

import { env } from "@/env.mjs"

// @todo: these will be used once we can create a custom google login button
const GoogleAuth = ({ loading }: { loading: boolean }) => {
  const { authIframeClient } = useTurnkey()
  const clientId = env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID

  const [nonce, setNonce] = useState("")
  const { loginWithOAuth } = useAuth()

  useEffect(() => {
    if (authIframeClient?.iframePublicKey) {
      const hashedPublicKey = sha256(
        authIframeClient.iframePublicKey as `0x${string}`
      ).replace(/^0x/, "")

      setNonce(hashedPublicKey)
    }
  }, [authIframeClient?.iframePublicKey])

  const onSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      loginWithOAuth(credentialResponse.credential as string)
    }
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {nonce && (
        <GoogleLogin
          nonce={nonce}
          containerProps={{
            className: "w-full bg-black flex justify-center ",
          }}
          theme="filled_black"
          width="100%"
          onSuccess={onSuccess}
          useOneTap={false}
        />
      )}
    </GoogleOAuthProvider>
  )
}

export default GoogleAuth
