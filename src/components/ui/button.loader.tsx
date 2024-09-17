import React from "react"
import { Loader } from "lucide-react"

import { Button, type ButtonProps } from "./button"

interface LoadingButtonProps extends ButtonProps {
  loading: boolean
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, children, ...props }, ref) => {
    return (
      <Button {...props} ref={ref}>
        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
