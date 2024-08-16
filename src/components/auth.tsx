import Link from "next/link"
import { Mail } from "lucide-react"

import { Icons } from "./icons"
import Legal from "./legal"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"

export default function Auth() {
  return (
    <>
      <Card className="mx-auto w-2/3 max-w-lg">
        <CardHeader className="space-y-4">
          <Icons.turnkey className="h-16 w-full  stroke-0 py-2 dark:stroke-white" />
          <CardTitle className="text-center text-xl font-medium">
            Login or Sign up
          </CardTitle>
          {/* <CardDescription>
            Enter your email below to login to your account
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              {/* <Label htmlFor="email">Email</Label> */}
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <Button type="submit" className="w-full font-semibold">
              Continue
            </Button>
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
            <Button variant="outline" className="w-full font-semibold">
              Continue with Email
            </Button>
            <Button variant="outline" className="w-full font-semibold">
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full font-semibold">
              Continue with Wallet
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Lost passkey?{" "}
            <Link href="#" className="underline" prefetch={false}>
              Recover your wallet here.
            </Link>
          </div>
        </CardContent>
      </Card>
      <Legal />
    </>
  )
}
