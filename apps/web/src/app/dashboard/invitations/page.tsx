'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useInvitations, useAcceptInvitation, useRejectInvitation } from '@/hooks/useInvitations'
import { useTranslations } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Check, X, Clock, Building2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function InvitationsPage() {
    const { data: invitations, isLoading } = useInvitations()
    const acceptInvitation = useAcceptInvitation()
    const rejectInvitation = useRejectInvitation()
    const t = useTranslations()

    const handleAccept = async (invitationId: string) => {
        try {
            await acceptInvitation.mutateAsync(invitationId)
        } catch (error) {
            console.error('Failed to accept invitation:', error)
        }
    }

    const handleReject = async (invitationId: string) => {
        try {
            await rejectInvitation.mutateAsync(invitationId)
        } catch (error) {
            console.error('Failed to reject invitation:', error)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t.invitations.pending}</Badge>
            case 'ACCEPTED':
                return <Badge variant="default"><Check className="h-3 w-3 mr-1" />{t.invitations.accepted}</Badge>
            case 'REJECTED':
                return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />{t.invitations.rejected}</Badge>
            case 'EXPIRED':
                return <Badge variant="outline">{t.invitations.expired}</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto p-6">
                    <div className="text-center">{t.invitations.loadingInvitations}</div>
                </div>
            </DashboardLayout>
        )
    }

    const pendingInvitations = invitations?.filter(inv => inv.status === 'PENDING') || []
    const pastInvitations = invitations?.filter(inv => inv.status !== 'PENDING') || []

    return (
        <DashboardLayout>
            <div className="container mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.invitations.title}</h1>
                    <p className="text-muted-foreground">
                        {t.invitations.manageDescription}
                    </p>
                </div>

                {/* Pending Invitations */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">{t.invitations.pendingInvitations}</h2>
                    {pendingInvitations.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t.invitations.noPending}</CardTitle>
                                <CardDescription>
                                    {t.invitations.noPendingDescription}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {pendingInvitations.map((invitation) => (
                                <Card key={invitation.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Building2 className="h-5 w-5" />
                                                    {invitation?.organization?.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    {t.invitations.invitedBy} {invitation?.invitedBy?.name} ({invitation?.invitedBy?.email})
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(invitation.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>
                                                {t.invitations.invited} {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {t.invitations.expires} {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleAccept(invitation.id)}
                                                disabled={acceptInvitation.isPending}
                                            >
                                                <Check className="mr-2 h-4 w-4" />
                                                {t.invitations.accept}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleReject(invitation.id)}
                                                disabled={rejectInvitation.isPending}
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                {t.invitations.reject}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Past Invitations */}
                {pastInvitations.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">{t.invitations.pastInvitations}</h2>
                        <div className="grid gap-4">
                            {pastInvitations.map((invitation) => (
                                <Card key={invitation.id} className="opacity-75">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Building2 className="h-5 w-5" />
                                                    {invitation?.organization?.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    {t.invitations.invitedBy} {invitation?.invitedBy?.name}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(invitation.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-muted-foreground">
                                            {invitation.status === 'ACCEPTED' && t.invitations.youAccepted}
                                            {invitation.status === 'REJECTED' && t.invitations.youRejected}
                                            {invitation.status === 'EXPIRED' && t.invitations.hasExpired}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
