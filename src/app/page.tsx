import Image from "next/image"

import { Button } from "@/components/ui/button"
import Auth from "@/components/auth"
import { ModeToggle } from "@/components/mode-toggle"

import gradient from "../../public/purple-gradient.png"
import Features from "../components/features"

export default function Landing() {
  return (
    <main className="grid h-screen md:grid-cols-[2fr,3fr]">
      <div className="relative hidden md:block">
        <Image
          className="absolute -z-10 h-full w-full object-cover dark:opacity-65"
          src={gradient}
          alt="gradient"
        />
        <Features />
      </div>
      <div className="flex flex-col items-center justify-center">
        <Auth />
        <ModeToggle className="absolute right-4 top-4" />
      </div>
    </main>
  )
}
