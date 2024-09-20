"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTurnkey } from "@turnkey/sdk-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Email } from "@/types/turnkey"
import { useUser } from "@/hooks/use-user"
import { LoadingButton } from "@/components/ui/button.loader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

import GoogleAuth from "./google-auth"
import { Icons } from "./icons"
import Legal from "./legal"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export default function Auth() {
  const { user } = useUser()
  const { passkeyClient } = useTurnkey()
  const { initEmailLogin, state, loginWithPasskey } = useAuth()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handlePasskeyLogin = async (email: Email) => {
    setLoadingAction("passkey")
    if (!passkeyClient) {
      setLoadingAction(null)
      return
    }

    await loginWithPasskey(email)
    setLoadingAction(null)
  }

  const handleEmailLogin = async (email: Email) => {
    setLoadingAction("email")
    await initEmailLogin(email)
    setLoadingAction(null)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const email = values.email as Email
    if (state.loading) return

    if (passkeyClient) {
      await handlePasskeyLogin(email)
    } else {
      await handleEmailLogin(email)
    }
  }

  return (
    <>
      <Card className="mx-auto w-full max-w-[450px]">
        <CardHeader className="space-y-4">
          <Icons.turnkey className="h-16 w-full stroke-0 py-2 dark:stroke-white" />
          <CardTitle className="text-center text-xl font-medium">
            Login or Sign up
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton
                type="submit"
                className="w-full font-semibold"
                disabled={!form.formState.isValid}
                loading={state.loading && loadingAction === "passkey"}
                onClick={() =>
                  handlePasskeyLogin(form.getValues().email as Email)
                }
              >
                Continue with passkey
              </LoadingButton>

              <LoadingButton
                type="button"
                variant="outline"
                className="w-full font-semibold"
                disabled={!form.formState.isValid}
                onClick={() =>
                  handleEmailLogin(form.getValues().email as Email)
                }
                loading={state.loading && loadingAction === "email"}
              >
                Continue with Email
              </LoadingButton>
            </form>
          </Form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <GoogleAuth loading={state.loading && loadingAction === "email"} />
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button disabled variant="outline" className="w-full font-semibold">
            Continue with Wallet
          </Button> */}
        </CardContent>
      </Card>
      <Legal />
    </>
  )
}
