import Link from "next/link"

import { Button } from "./ui/button"

export default function Legal() {
  return (
    <div className="py-4 text-sm text-muted-foreground">
      By continuing, you agree to{" "}
      <Button variant="link" className="p-0 ">
        <Link href="https://www.turnkey.com/legal/terms">
          {" "}
          Terms & Conditions
        </Link>
      </Button>{" "}
      and{" "}
      <Button variant="link" className="p-0 ">
        <Link href="https://www.turnkey.com/legal/terms">Privacy Policy</Link>
      </Button>
    </div>
  )
}
