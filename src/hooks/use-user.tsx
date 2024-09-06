import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTurnkey } from "@turnkey/sdk-react"

import { User } from "@/types/turnkey"

export const useUser = () => {
  const { turnkey } = useTurnkey()
  const router = useRouter()
  const [user, setUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    const fetchUser = async () => {
      console.log("fetching user", turnkey)
      if (turnkey) {
        console.log("fetching user")
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
