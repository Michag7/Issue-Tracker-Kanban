'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useTranslations } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    LayoutDashboard,
    Building2,
    Mail,
    LogOut,
    ChevronDown,
    Menu,
    X
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth()
    const { activeOrgId } = useOrganization()
    const { data: organizations } = useOrganizations()
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const t = useTranslations()

    const activeOrg = organizations?.find(org => org.id === activeOrgId)

    const navigation = [
        { name: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
        { name: t.nav.organizations, href: '/dashboard/organizations', icon: Building2 },
        { name: t.nav.invitations, href: '/dashboard/invitations', icon: Mail },
    ]

    const handleLogout = () => {
        logout()
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b px-6">
                        <h1 className="text-xl font-bold">{t.nav.issueTracker}</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Active Organization */}
                    {activeOrg && (
                        <div className="border-b p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{activeOrg.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/organizations/${activeOrgId}/issues`)}
                                >
                                    {t.nav.board}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            }
                    `}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </ScrollArea>

                    <Separator />

                    {/* User Menu */}
                    <div className="p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="text-sm font-medium truncate w-full">{user?.name}</span>
                                            <span className="text-xs text-muted-foreground truncate w-full">{user?.email}</span>
                                        </div>
                                    </div>
                                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>{t.nav.myAccount}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    {t.nav.logout}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex h-16 items-center gap-4 border-b bg-card px-6 lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">{t.nav.issueTracker}</h1>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
