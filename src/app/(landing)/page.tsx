import { AuthProvider } from "@/providers/auth-provider"

import Auth from "@/components/auth"
import { ModeToggle } from "@/components/mode-toggle"

export default function Landing() {
  return (
    <main className="flex flex-col items-center justify-center">
      <Auth />
    </main>
  )
}
