import Link from "next/link"

import { Button } from "./ui/button"

export default function Legal() {
  return (
    <div className=" py-4 text-xs text-muted-foreground lg:text-sm">
      By continuing, you agree to{" "}
      <Button variant="link" className="p-0 text-xs lg:text-sm">
        <Link target="_blank" href="https://www.turnkey.com/legal/terms">
          Terms & Conditions
        </Link>
      </Button>{" "}
      and{" "}
      <Button variant="link" className="p-0 text-xs lg:text-sm">
        <Link target="_blank" href="https://www.turnkey.com/legal/privacy">
          Privacy Policy
        </Link>
      </Button>
    </div>
  )
}
