import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "./_components/sidebar-nav"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
    <div className="space-y-6 p-4 pb-16 md:p-10">
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
            </Link>
        </div>
        <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Settings</h2>
        <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
        </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
    </div>
    </div>
  )
}
