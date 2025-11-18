'use client'

import { useState } from 'react'
import { useIssue, useUpdateIssue } from '@/hooks/useIssues'
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/useComments'
import { useIssueHistory } from '@/hooks/useHistory'
import { useOrganizationMembers } from '@/hooks/useOrganizations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, History, Trash2, Edit2, Send, Calendar, User } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { useTranslations } from '@/lib/i18n'

interface IssueDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    issueId: string | null
    orgId: string
}

export function IssueDetailsModal({ open, onOpenChange, issueId, orgId }: IssueDetailsModalProps) {
    const t = useTranslations()
    const { data: issue, isLoading: issueLoading } = useIssue(orgId, issueId)
    const { data: comments } = useComments(orgId, issueId)
    const { data: history } = useIssueHistory(orgId, issueId)
    const { data: members } = useOrganizationMembers(orgId)
    const updateIssue = useUpdateIssue(orgId)
    const createComment = useCreateComment(orgId, issueId!)
    const updateComment = useUpdateComment(orgId, issueId!)
    const deleteComment = useDeleteComment(orgId, issueId!)

    const [commentText, setCommentText] = useState('')
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const [editingCommentText, setEditingCommentText] = useState('')

    const currentUserId = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('user') || '{}').id
        : null

    const handleAddComment = async () => {
        if (!commentText.trim()) return

        try {
            await createComment.mutateAsync({ content: commentText })
            setCommentText('')
        } catch (error) {
            console.error('Failed to create comment:', error)
        }
    }

    const handleUpdateComment = async (commentId: string) => {
        if (!editingCommentText.trim()) return

        try {
            await updateComment.mutateAsync({
                commentId,
                data: { content: editingCommentText }
            })
            setEditingCommentId(null)
            setEditingCommentText('')
        } catch (error) {
            console.error('Failed to update comment:', error)
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return

        try {
            await deleteComment.mutateAsync(commentId)
        } catch (error) {
            console.error('Failed to delete comment:', error)
        }
    }

    const handleUpdateField = async (field: string, value: string | null | undefined) => {
        if (!issueId) return

        try {
            await updateIssue.mutateAsync({
                issueId,
                data: { [field]: value }
            })
        } catch (error) {
            console.error('Failed to update issue:', error)
        }
    }

    if (!issueId || !issue) {
        return null
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{issue.title}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Description */}
                        <div>
                            <h3 className="font-medium mb-2">{t.issues.description}</h3>
                            {issue.description ? (
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{issue.description}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t.issues.noDescription}</p>
                            )}
                        </div>

                        {/* Tabs for Comments and History */}
                        <Tabs defaultValue="comments" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="comments">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    {t.issues.comments} ({comments?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="history">
                                    <History className="h-4 w-4 mr-2" />
                                    {t.issues.history}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="comments" className="space-y-4">
                                {/* Add Comment */}
                                <div className="space-y-2">
                                    <Textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder={t.issues.addCommentPlaceholder}
                                        rows={3}
                                    />
                                    <Button
                                        onClick={handleAddComment}
                                        disabled={createComment.isPending || !commentText.trim()}
                                        size="sm"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {t.issues.addComment}
                                    </Button>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-3">
                                    {comments?.map((comment) => (
                                        <Card key={comment.id}>
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>
                                                                {comment?.author?.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">{comment?.author?.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {comment.authorId === currentUserId && (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setEditingCommentId(comment.id)
                                                                    setEditingCommentText(comment.content)
                                                                }}
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {editingCommentId === comment.id ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            value={editingCommentText}
                                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateComment(comment.id)}
                                                            >
                                                                {t.common.save}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingCommentId(null)
                                                                    setEditingCommentText('')
                                                                }}
                                                            >
                                                                {t.common.cancel}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm">{comment.content}</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {comments?.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            {t.issues.noComments}
                                        </p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="history" className="space-y-2">
                                {history?.map((entry) => (
                                    <Card key={entry.id}>
                                        <CardContent className="p-3">
                                            <div className="flex items-start gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">
                                                        {entry?.actor?.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="text-sm">
                                                        <span className="font-medium">{entry?.actor?.name}</span>
                                                        {' '}
                                                        changed <span className="font-medium">{entry.fieldChanged}</span>
                                                        {entry.oldValue && entry.newValue && (
                                                            <>
                                                                {' '}from <span className="text-muted-foreground">{entry.oldValue}</span>
                                                                {' '}to <span className="text-muted-foreground">{entry.newValue}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {history?.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        {t.issues.noHistory}
                                    </p>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.issues.status}</label>
                            <Select
                                value={issue.status}
                                onValueChange={(value) => handleUpdateField('status', value)}
                            >
                                <SelectTrigger>
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
                            <label className="text-sm font-medium">{t.issues.priority}</label>
                            <Select
                                value={issue.priority}
                                onValueChange={(value) => handleUpdateField('priority', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">{t.issues.priorities.LOW}</SelectItem>
                                    <SelectItem value="MEDIUM">{t.issues.priorities.MEDIUM}</SelectItem>
                                    <SelectItem value="HIGH">{t.issues.priorities.HIGH}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assignee */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {t.issues.assignee}
                            </label>
                            <Select
                                value={issue.assigneeId || 'unassigned'}
                                onValueChange={(value) => handleUpdateField('assigneeId', value === 'unassigned' ? null : value)}
                            >
                                <SelectTrigger>
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

                        {/* Labels */}
                        {issue.tags && issue.tags.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.issues.labels}</label>
                                <div className="flex flex-wrap gap-1">
                                    {issue.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Due Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t.issues.dueDate}
                            </label>
                            <input
                                type="date"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={issue.dueDate ? format(new Date(issue.dueDate), 'yyyy-MM-dd') : ''}
                                onChange={(e) => handleUpdateField('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                            />
                        </div>

                        {/* Reporter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t.issues.reporter}</label>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                        {issue?.reporter?.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{issue?.reporter?.name}</span>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>Created {format(new Date(issue.createdAt), 'MMM d, yyyy')}</p>
                            <p>Updated {format(new Date(issue.updatedAt), 'MMM d, yyyy')}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
