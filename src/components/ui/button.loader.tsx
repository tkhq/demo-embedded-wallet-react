import { Loader } from "lucide-react"

import { Button, type ButtonProps } from "./button"

interface LoadingButton {
  onClick: () => void
  className?: string
  loading: boolean
  children: React.ReactNode
  variant?: ButtonProps["variant"]
}

export function LoadingButton({
  onClick,
  className,
  loading,
  children,
  variant,
}: LoadingButton) {
  return (
    <Button
      type="button"
      className={`w-full font-semibold ${className}`}
      onClick={onClick}
      disabled={loading}
      variant={variant}
    >
      {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
