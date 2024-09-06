import { useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TurnkeyContext } from "@/providers/turnkey-provider"

import { User } from "@/types/turnkey"

export const useUser = () => {
  const { turnkey } = useContext(TurnkeyContext)
  const router = useRouter()
  const [user, setUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    const fetchUser = async () => {
      if (turnkey) {
        const currentUser = await turnkey.getCurrentUser()
        console.log({ currentUser })

        if (currentUser) {
          setUser(currentUser)
        } else {
          router.push("/")
        }
      }
    }
    fetchUser()
  }, [turnkey])

  const logout = async () => {
    if (turnkey) {
      await turnkey.logoutUser()
      setUser(undefined)
      router.push("/")
    }
  }

  return { user, logout }
}
