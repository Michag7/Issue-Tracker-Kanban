'use client'

import { useState } from 'react'
import { useOrganizationMembers } from '@/hooks/useOrganizations'
import { useCreateIssue, IssueStatus, IssuePriority } from '@/hooks/useIssues'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

interface CreateIssueModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orgId: string
}

export function CreateIssueModal({ open, onOpenChange, orgId }: CreateIssueModalProps) {
    const t = useTranslations()
    const { data: members } = useOrganizationMembers(orgId)
    const createIssue = useCreateIssue(orgId)

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<IssueStatus>('TODO' as IssueStatus)
    const [priority, setPriority] = useState<IssuePriority>('MEDIUM' as IssuePriority)
    const [assigneeId, setAssigneeId] = useState<string>('unassigned')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [dueDate, setDueDate] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await createIssue.mutateAsync({
                title,
                description: description || undefined,
                status,
                priority,
                assigneeId: assigneeId !== 'unassigned' ? assigneeId : undefined,
                tags: tags.length > 0 ? tags : undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            })

            // Reset form
            setTitle('')
            setDescription('')
            setStatus('TODO' as IssueStatus)
            setPriority('MEDIUM' as IssuePriority)
            setAssigneeId('unassigned')
            setTags([])
            setTagInput('')
            setDueDate('')

            onOpenChange(false)
        } catch (error) {
            console.error('Failed to create issue:', error)
        }
    }

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.issues.new}</DialogTitle>
                    <DialogDescription>
                        {t.issues.createDescription}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">{t.issues.title} *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t.issues.titlePlaceholder}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{t.issues.description}</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t.issues.descriptionPlaceholder}
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t.issues.markdownHint}
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">{t.issues.status}</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as IssueStatus)}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">{t.issues.statuses.TODO}</SelectItem>
                                    <SelectItem value="IN_PROGRESS">{t.issues.statuses.IN_PROGRESS}</SelectItem>
                                    <SelectItem value="DONE">{t.issues.statuses.DONE}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label htmlFor="priority">{t.issues.priority}</Label>
                            <Select value={priority} onValueChange={(value) => setPriority(value as IssuePriority)}>
                                <SelectTrigger id="priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">{t.issues.priorities.LOW}</SelectItem>
                                    <SelectItem value="MEDIUM">{t.issues.priorities.MEDIUM}</SelectItem>
                                    <SelectItem value="HIGH">{t.issues.priorities.HIGH}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Assignee */}
                        <div className="space-y-2">
                            <Label htmlFor="assignee">{t.issues.assignee}</Label>
                            <Select value={assigneeId} onValueChange={setAssigneeId}>
                                <SelectTrigger id="assignee">
                                    <SelectValue placeholder={t.issues.unassigned} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">{t.issues.unassigned}</SelectItem>
                                    {members?.map((member: { id: string; name: string; email: string }) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">{t.issues.dueDate}</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="tags">{t.issues.labels}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t.issues.labelsPlaceholder}
                            />
                            <Button type="button" variant="secondary" onClick={addTag}>
                                {t.common.add}
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t.common.cancel}
                        </Button>
                        <Button type="submit" disabled={createIssue.isPending || !title.trim()}>
                            {createIssue.isPending ? t.common.creating : t.issues.create}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
