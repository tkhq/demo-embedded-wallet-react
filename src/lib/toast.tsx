import { toast } from "sonner"

import ViewTransactionButton from "@/components/view-transaction.button"

export const showTransactionToast = ({
  id,
  hash,
  title,
  description,
  type = "loading",
}: {
  id?: number | string
  hash?: string
  title: string
  description: string
  type?: "loading" | "success" | "error"
}) => {
  if (type === "loading") {
    return toast.loading(title, {
      id,
      description,
      action: <ViewTransactionButton hash={hash} />,
    })
  }
  return toast[type](title, {
    id,
    description,
    action: <ViewTransactionButton hash={hash} />,
  })
}
