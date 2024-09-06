import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "Demo Embedded Wallet",
  author: "turnkey",
  description:
    "A comprehensive demo showcasing how to build an embedded wallet using Turnkey.",
  keywords: [
    "Turnkey",
    "Web3",
    "Next.js",
    "React",
    "Tailwind CSS",
    "Radix UI",
    "shadcn/ui",
  ],
  url: {
    base: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    author: "https://turnkey.io",
  },
  links: {
    github: "https://github.com/tkhq/demo-embedded-wallet",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
}
