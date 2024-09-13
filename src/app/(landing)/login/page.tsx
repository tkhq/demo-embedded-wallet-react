import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/icons"
import Login from "@/components/login"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Card className="mx-auto w-2/3 max-w-lg">
        <CardHeader className="space-y-4">
          <Icons.turnkey className="h-16 w-full  stroke-0 py-2 dark:stroke-white" />
          <CardTitle className="text-center text-xl font-medium">
            Welcome!
          </CardTitle>
          <CardDescription className="text-center">
            Sign in using your new passkey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Login />
        </CardContent>
      </Card>
    </main>
  )
}
