import NavMenu from "@/components/nav-menu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // <main className="grid h-screen text-center sm:grid-cols-[200px_1fr] xl:grid-cols-[270px_1fr]">
    <main className=" h-screen dark:bg-neutral-950/80">
      <NavMenu />
      <div className="">{children}</div>
    </main>
  )
}
