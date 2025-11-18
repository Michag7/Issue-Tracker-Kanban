'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Issue } from '@/hooks/useIssues'
import { useTranslations } from '@/lib/i18n'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Flag, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface IssueCardProps {
    issue: Issue
    onClick: () => void
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
    const t = useTranslations()
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: issue.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return 'text-red-500'
            case 'MEDIUM':
                return 'text-yellow-500'
            case 'LOW':
                return 'text-blue-500'
            default:
                return 'text-gray-500'
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return <Badge variant="destructive">{t.issues.priorities.HIGH}</Badge>
            case 'MEDIUM':
                return <Badge variant="secondary">{t.issues.priorities.MEDIUM}</Badge>
            case 'LOW':
                return <Badge variant="outline">{t.issues.priorities.LOW}</Badge>
            default:
                return <Badge>{priority}</Badge>
        }
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={onClick}
            >
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm line-clamp-2">{issue.title}</h3>
                        <Flag className={`h-4 w-4 flex-shrink-0 ${getPriorityColor(issue.priority)}`} />
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
                    {issue.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {issue.description}
                        </p>
                    )}

                    {issue.tags && issue.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {issue.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                    <Tag className="h-2.5 w-2.5 mr-1" />
                                    {tag}
                                </Badge>
                            ))}
                            {issue.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{issue.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {issue.assignee ? (
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                        {issue.assignee.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">?</span>
                                </div>
                            )}
                            {issue.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(issue.dueDate), 'MMM d')}</span>
                                </div>
                            )}
                        </div>
                        {getPriorityBadge(issue.priority)}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
