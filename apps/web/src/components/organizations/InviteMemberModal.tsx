'use client'

import { useState } from 'react'
import { useCreateInvitation } from '@/hooks/useInvitations'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Mail, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from '@/lib/i18n'

interface InviteMemberModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orgId: string
}

export function InviteMemberModal({
    open,
    onOpenChange,
    orgId,
}: InviteMemberModalProps) {
    const t = useTranslations()
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')

    const createInvitation = useCreateInvitation(orgId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error(t.organizations.emailRequired)
            return
        }

        try {
            await createInvitation.mutateAsync({ email, role })
            toast.success(t.organizations.invitationSent)
            setEmail('')
            setRole('MEMBER')
            onOpenChange(false)
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : t.organizations.invitationError;
            toast.error(errorMessage)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        {t.organizations.inviteMember}
                    </DialogTitle>
                    <DialogDescription>
                        {t.organizations.inviteDescription}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.organizations.emailAddress}</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder={t.organizations.emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                disabled={createInvitation.isPending}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">{t.organizations.role}</Label>
                        <Select
                            value={role}
                            onValueChange={(value) => setRole(value as 'ADMIN' | 'MEMBER')}
                            disabled={createInvitation.isPending}
                        >
                            <SelectTrigger id="role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MEMBER">{t.organizations.member}</SelectItem>
                                <SelectItem value="ADMIN">{t.organizations.admin}</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            {role === 'ADMIN'
                                ? t.organizations.adminDescription
                                : t.organizations.memberDescription}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createInvitation.isPending}
                        >
                            {t.common.cancel}
                        </Button>
                        <Button type="submit" disabled={createInvitation.isPending}>
                            {createInvitation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t.organizations.sending}
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {t.organizations.sendInvitation}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
