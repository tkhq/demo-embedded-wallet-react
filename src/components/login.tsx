"use client"

import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Login() {
  const { loginWithPasskey, state } = useAuth()
  const [email, setEmail] = useState<string>("")

  const handleLogin = async () => {
    await loginWithPasskey()
  }

  return (
    <div className="grid gap-4">
      <Button
        className="w-full font-semibold"
        onClick={handleLogin}
        disabled={state.loading}
      >
        Login
      </Button>
    </div>
  )
}
