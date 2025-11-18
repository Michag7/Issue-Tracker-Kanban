'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IssueCard } from './IssueCard'
import { Issue, IssueStatus } from '@/hooks/useIssues'

interface DroppableColumnProps {
    column: { id: IssueStatus; title: string; color: string }
    issues: Issue[]
    onIssueClick: (issueId: string) => void
}

export function DroppableColumn({ column, issues, onIssueClick }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `droppable-${column.id}`,
        data: {
            type: 'column',
            status: column.id,
        },
    })

    const itemIds = issues.map(i => i.id)

    return (
        <div className="flex-1 min-w-[320px] max-w-[400px]">
            <Card className={`h-full flex flex-col transition-colors ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}>
                <CardHeader className={`border-b ${column.color}`}>
                    <CardTitle className="flex items-center justify-between text-base">
                        <span>{column.title}</span>
                        <Badge variant="secondary">{issues.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-y-auto" ref={setNodeRef}>
                    <SortableContext
                        id={column.id}
                        items={itemIds}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3 min-h-[200px]">
                            {issues.map((issue) => (
                                <IssueCard
                                    key={issue.id}
                                    issue={issue}
                                    onClick={() => onIssueClick(issue.id)}
                                />
                            ))}
                            {issues.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg">
                                    Drop issues here
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </CardContent>
            </Card>
        </div>
    )
}
