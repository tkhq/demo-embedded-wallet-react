import Image from "next/image"

import Features from "@/components/features"
import { ModeToggle } from "@/components/mode-toggle"

import gradient from "../../../public/purple-gradient.png"

interface LandingLayoutProps {
  children: React.ReactNode
}

export default function LandingLayout({ children }: LandingLayoutProps) {
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
      {children}
      {/* <ModeToggle className="absolute right-4 top-4" /> */}
    </main>
  )
}
