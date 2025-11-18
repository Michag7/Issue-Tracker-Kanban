'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useInvitations } from '@/hooks/useInvitations'
import { useTranslations } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Mail, ListTodo, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const { activeOrgId } = useOrganization()
    const { data: organizations, isLoading: orgsLoading } = useOrganizations()
    const { data: invitations, isLoading: invitationsLoading } = useInvitations()
    const t = useTranslations()

    const activeOrg = organizations?.find(org => org.id === activeOrgId)
    const pendingInvitations = invitations?.filter(inv => inv.status === 'PENDING') || []

    return (
        <DashboardLayout>
            <div className="container mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.nav.dashboard}</h1>
                    <p className="text-muted-foreground">
                        {t.dashboard.welcomeBack} {t.dashboard.overviewDescription}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Organizations Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t.dashboard.organizationsCard}</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{organizations?.length || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {activeOrg ? `${t.organizations.active}: ${activeOrg.name}` : t.dashboard.noActiveOrg}
                            </p>
                            <Link href="/dashboard/organizations">
                                <Button variant="link" size="sm" className="mt-2 px-0">
                                    {t.dashboard.viewAllOrganizations}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Invitations Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t.dashboard.pendingInvitationsCard}</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingInvitations.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t.dashboard.invitationsWaiting}
                            </p>
                            <Link href="/dashboard/invitations">
                                <Button variant="link" size="sm" className="mt-2 px-0">
                                    {t.dashboard.viewInvitations}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t.dashboard.quickActions}</CardTitle>
                            <ListTodo className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {activeOrgId ? (
                                <Link href={`/dashboard/organizations/${activeOrgId}/issues`}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <ListTodo className="mr-2 h-4 w-4" />
                                        {t.dashboard.viewIssuesBoard}
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/dashboard/organizations">
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t.dashboard.createOrganization}
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity or Empty State */}
                {!activeOrgId && organizations?.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.dashboard.getStarted}</CardTitle>
                            <CardDescription>
                                {t.dashboard.getStartedDescription}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/organizations">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t.dashboard.createFirstOrganization}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {activeOrgId && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.dashboard.activeOrganization}</CardTitle>
                            <CardDescription>
                                {t.dashboard.currentlyWorkingIn} {activeOrg?.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/dashboard/organizations/${activeOrgId}/issues`}>
                                <Button>
                                    <ListTodo className="mr-2 h-4 w-4" />
                                    {t.dashboard.goToBoard}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
