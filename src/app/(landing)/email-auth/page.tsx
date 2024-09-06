"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Loader, Send } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/icons"

function EmailAuthContent() {
  const searchParams = useSearchParams()
  const { completeEmailAuth } = useAuth()
  const userEmail = searchParams.get("userEmail")
  const continueWith = searchParams.get("continueWith")
  const credentialBundle = searchParams.get("credentialBundle")

  useEffect(() => {
    if (userEmail && continueWith && credentialBundle) {
      completeEmailAuth({ userEmail, continueWith, credentialBundle })
    }
  }, [])

  return (
    <main className="flex flex-col items-center justify-center">
      <Card className="mx-auto w-2/3 max-w-lg">
        <CardHeader className="space-y-4">
          <Icons.turnkey className="h-14 w-full stroke-0 py-2 dark:stroke-white" />
          <CardTitle className="flex  items-center justify-center text-center">
            {credentialBundle ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="animate-pulse">Authenticating...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-lg font-medium">
                Magic link sent <Send className="h-5 w-5" />
              </div>
            )}
          </CardTitle>
          {!credentialBundle && (
            <CardDescription className="text-center">
              A confirmation link has been sent to your email. Click the link to
              sign in.
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </main>
  )
}

export default function EmailAuth() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailAuthContent />
    </Suspense>
  )
}
