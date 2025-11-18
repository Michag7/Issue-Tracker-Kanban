'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    UniqueIdentifier,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useIssuesByOrganization, useReorderIssue, Issue, IssueStatus, IssueFilters as IssueFiltersType } from '@/hooks/useIssues'
import { useOrganizations } from '@/hooks/useOrganizations'
import { IssueCard } from '@/components/issues/IssueCard'
import { DroppableColumn } from '@/components/issues/DroppableColumn'
import { CreateIssueModal } from '@/components/issues/CreateIssueModal'
import { IssueDetailsModal } from '@/components/issues/IssueDetailsModal'
import { InviteMemberModal } from '@/components/organizations/InviteMemberModal'
import { IssueFilters } from '@/components/issues/IssueFilters'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, UserPlus } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

export default function KanbanBoardPage() {
    const t = useTranslations()
    const params = useParams()
    const orgId = params?.orgId as string

    const [filters, setFilters] = useState<IssueFiltersType>({})
    const { data: issues = [], isLoading } = useIssuesByOrganization(orgId, filters)
    const { data: organizations } = useOrganizations()
    const reorderIssueMutation = useReorderIssue(orgId)

    const COLUMNS: { id: IssueStatus; title: string; color: string }[] = [
        { id: 'TODO' as IssueStatus, title: t.issues.statuses.TODO, color: 'bg-slate-100' },
        { id: 'IN_PROGRESS' as IssueStatus, title: t.issues.statuses.IN_PROGRESS, color: 'bg-blue-100' },
        { id: 'DONE' as IssueStatus, title: t.issues.statuses.DONE, color: 'bg-green-100' },
    ]

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)

    // Obtener la organización actual del board (NO del sidebar)
    const currentOrg = organizations?.find((org) => org.id === orgId)
    const isAdmin = currentOrg?.userRole === 'ADMIN'

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const getIssuesByStatus = (status: IssueStatus): Issue[] => {
        return issues
            .filter((issue) => issue.status === status && issue.orgId === orgId)
            .sort((a, b) => a.position - b.position)
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id)
    }

    const handleDragOver = (event: DragOverEvent) => {
        // Solo para preview visual, no hacer cambios
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeIssue = issues.find((i) => i.id === activeId)
        if (!activeIssue) return

        let targetStatus: IssueStatus
        let newPosition: number

        // Detectar si se soltó en una columna vacía (droppable container)
        const targetColumn = COLUMNS.find(col => `droppable-${col.id}` === overId || col.id === overId)

        if (targetColumn) {
            // Soltar en columna (vacía o no)
            targetStatus = targetColumn.id
            const columnIssues = getIssuesByStatus(targetStatus)
            newPosition = columnIssues.length

            if (activeIssue.status !== targetStatus || activeIssue.position !== newPosition) {
                reorderIssueMutation.mutate({
                    issueId: activeIssue.id,
                    status: targetStatus,
                    position: newPosition,
                })
            }
            return
        }

        // Si se soltó sobre otra issue
        const overIssue = issues.find((i) => i.id === overId)
        if (!overIssue) return

        targetStatus = overIssue.status
        const columnIssues = getIssuesByStatus(targetStatus)

        if (activeIssue.status === targetStatus) {
            // Mismo status: reordenar dentro de columna
            const oldIndex = columnIssues.findIndex((i) => i.id === activeId)
            const newIndex = columnIssues.findIndex((i) => i.id === overId)

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                newPosition = newIndex
                reorderIssueMutation.mutate({
                    issueId: activeIssue.id,
                    status: targetStatus,
                    position: newPosition,
                })
            }
        } else {
            // Cambio de columna: mover a la posición de la issue sobre la que se soltó
            const overIndex = columnIssues.findIndex((i) => i.id === overId)
            newPosition = overIndex >= 0 ? overIndex : columnIssues.length

            reorderIssueMutation.mutate({
                issueId: activeIssue.id,
                status: targetStatus,
                position: newPosition,
            })
        }
    }

    const handleIssueClick = (issueId: string) => {
        setSelectedIssueId(issueId)
    }

    const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="border-b bg-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{t.issues.board}</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t.issues.boardDescription}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {isAdmin && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsInviteModalOpen(true)}
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {t.organizations.addMember}
                                </Button>
                            )}
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t.issues.new}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <IssueFilters orgId={orgId} filters={filters} onFiltersChange={setFilters} />

                {/* Kanban Board */}
                <div className="flex-1 overflow-x-auto p-6">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-6 h-full min-w-max">
                            {COLUMNS.map((column) => {
                                const columnIssues = getIssuesByStatus(column.id)

                                return (
                                    <DroppableColumn
                                        key={column.id}
                                        column={column}
                                        issues={columnIssues}
                                        onIssueClick={handleIssueClick}
                                    />
                                )
                            })}
                        </div>

                        <DragOverlay>
                            {activeId && activeIssue ? (
                                <div className="rotate-3 opacity-80">
                                    <IssueCard issue={activeIssue} onClick={() => { }} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* Modals */}
            <CreateIssueModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                orgId={orgId}
            />

            <InviteMemberModal
                open={isInviteModalOpen}
                onOpenChange={setIsInviteModalOpen}
                orgId={orgId}
            />

            <IssueDetailsModal
                open={!!selectedIssueId}
                onOpenChange={(open) => !open && setSelectedIssueId(null)}
                issueId={selectedIssueId}
                orgId={orgId}
            />
        </DashboardLayout>
    )
}
