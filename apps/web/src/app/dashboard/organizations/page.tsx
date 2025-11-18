'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useOrganizations, useCreateOrganization, useSetActiveOrganization } from '@/hooks/useOrganizations'
import { useTranslations } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Building2, Plus, Check, Crown, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OrganizationsPage() {
    const router = useRouter()
    const { activeOrgId } = useOrganization()
    const { data: organizations, isLoading } = useOrganizations()
    const createOrg = useCreateOrganization()
    const setActiveOrg = useSetActiveOrganization()
    const t = useTranslations()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createOrg.mutateAsync({ name, slug })
            setIsDialogOpen(false)
            setName('')
            setSlug('')
        } catch (error) {
            console.error('Failed to create organization:', error)
        }
    }

    const handleSetActive = async (orgId: string) => {
        try {
            await setActiveOrg.mutateAsync(orgId)
            router.push(`/dashboard/organizations/${orgId}/issues`)
        } catch (error) {
            console.error('Failed to set active organization:', error)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto p-6">
                    <div className="text-center">{t.dashboard.loadingOrganizations}</div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t.organizations.title}</h1>
                        <p className="text-muted-foreground">
                            {t.organizations.manageDescription}
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                {t.organizations.create}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t.organizations.createOrganization}</DialogTitle>
                                <DialogDescription>
                                    {t.organizations.createDescription}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateOrg}>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t.organizations.organizationName}</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => {
                                                setName(e.target.value)
                                                // Auto-generate slug
                                                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                                            }}
                                            placeholder={t.organizations.organizationNamePlaceholder}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">{t.organizations.slug}</Label>
                                        <Input
                                            id="slug"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder={t.organizations.slugPlaceholder}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t.organizations.slugDescription}
                                        </p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createOrg.isPending}>
                                        {createOrg.isPending ? t.organizations.creating : t.organizations.createOrganization}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {organizations && organizations.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.organizations.noOrganizations}</CardTitle>
                            <CardDescription>
                                {t.organizations.noOrganizationsDesc}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t.organizations.noOrganizationsHelp}
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t.organizations.createFirst}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {organizations?.map((org) => (
                            <Card
                                key={org.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${org.id === activeOrgId ? 'ring-2 ring-primary' : ''
                                    }`}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                            <CardTitle className="text-lg">{org.name}</CardTitle>
                                        </div>
                                        {org.id === activeOrgId && (
                                            <Badge variant="default">
                                                <Check className="h-3 w-3 mr-1" />
                                                {t.organizations.active}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>/{org.slug}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {org?.userRole === 'ADMIN' ? (
                                            <>
                                                <Crown className="h-4 w-4" />
                                                <span>{t.organizations.admin}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Users className="h-4 w-4" />
                                                <span>{t.organizations.member}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {org.id !== activeOrgId && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSetActive(org.id)}
                                                disabled={setActiveOrg.isPending}
                                            >
                                                {t.organizations.setActive}
                                            </Button>
                                        )}
                                        <Button
                                            variant={org.id === activeOrgId ? 'default' : 'secondary'}
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/organizations/${org.id}/issues`)}
                                        >
                                            {t.organizations.viewBoard}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
