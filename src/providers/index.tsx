"use client"

import { AuthProvider } from "./auth-provider"
import { ThemeProvider } from "./theme-provider"
import { TurnkeyProvider } from "./turnkey-provider"

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <TurnkeyProvider>
      <AuthProvider> {children}</AuthProvider>
    </TurnkeyProvider>
  </ThemeProvider>
)
