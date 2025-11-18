'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@/lib/i18n'
import { IssueFilters as IssueFiltersType, IssuePriority } from '@/hooks/useIssues'
import { useOrganizationMembers } from '@/hooks/useOrganizations'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Search, X, Calendar as CalendarIcon, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

interface IssueFiltersProps {
    orgId: string
    filters: IssueFiltersType
    onFiltersChange: (filters: IssueFiltersType) => void
}

interface OrganizationMember {
    id: string
    name: string
    email: string
}

export function IssueFilters({ orgId, filters, onFiltersChange }: IssueFiltersProps) {
    const t = useTranslations()
    const { data: members } = useOrganizationMembers(orgId)
    const [searchInput, setSearchInput] = useState(filters.search || '')
    const debouncedSearch = useDebounce(searchInput, 500)
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        filters.dueDateFrom ? new Date(filters.dueDateFrom) : undefined
    )
    const [dateTo, setDateTo] = useState<Date | undefined>(
        filters.dueDateTo ? new Date(filters.dueDateTo) : undefined
    )

    const locale = typeof window !== 'undefined'
        ? (localStorage.getItem('locale') === 'es' ? es : enUS)
        : enUS

    // Aplicar debounced search
    useEffect(() => {
        onFiltersChange({ ...filters, search: debouncedSearch || undefined })
    }, [debouncedSearch])

    const handleSearchChange = (value: string) => {
        setSearchInput(value)
    }

    const handlePriorityChange = (value: string) => {
        onFiltersChange({
            ...filters,
            priority: value === 'all' ? undefined : (value as IssuePriority),
        })
    }

    const handleAssigneeChange = (value: string) => {
        onFiltersChange({
            ...filters,
            assigneeId: value === 'all' ? undefined : value,
        })
    }

    const handleDateFromChange = (date: Date | undefined) => {
        setDateFrom(date)
        onFiltersChange({
            ...filters,
            dueDateFrom: date ? format(date, 'yyyy-MM-dd') : undefined,
        })
    }

    const handleDateToChange = (date: Date | undefined) => {
        setDateTo(date)
        onFiltersChange({
            ...filters,
            dueDateTo: date ? format(date, 'yyyy-MM-dd') : undefined,
        })
    }

    const handleClearFilters = () => {
        setSearchInput('')
        setDateFrom(undefined)
        setDateTo(undefined)
        onFiltersChange({})
    }

    const hasActiveFilters =
        filters.search ||
        filters.priority ||
        filters.assigneeId ||
        filters.dueDateFrom ||
        filters.dueDateTo

    const activeFilterCount = [
        filters.search,
        filters.priority,
        filters.assigneeId,
        filters.dueDateFrom || filters.dueDateTo,
    ].filter(Boolean).length

    return (
        <Card className="border-b rounded-none">
            <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                    {/* Primera fila: Búsqueda y botón limpiar */}
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t.issues.searchPlaceholder}
                                value={searchInput}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => handleSearchChange('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {hasActiveFilters && (
                                <>
                                    <Badge variant="secondary" className="gap-1">
                                        <Filter className="h-3 w-3" />
                                        {activeFilterCount}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        {t.issues.clearFilters}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Segunda fila: Selectores */}
                    <div className="flex flex-wrap gap-4">
                        {/* Prioridad */}
                        <div className="flex-1 min-w-[200px]">
                            <Select
                                value={filters.priority || 'all'}
                                onValueChange={handlePriorityChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t.issues.priority} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.issues.allPriorities}</SelectItem>
                                    <SelectItem value="LOW">{t.issues.priorities.LOW}</SelectItem>
                                    <SelectItem value="MEDIUM">{t.issues.priorities.MEDIUM}</SelectItem>
                                    <SelectItem value="HIGH">{t.issues.priorities.HIGH}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Asignado a */}
                        <div className="flex-1 min-w-[200px]">
                            <Select
                                value={filters.assigneeId || 'all'}
                                onValueChange={handleAssigneeChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t.issues.assignee} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.issues.allAssignees}</SelectItem>
                                    <SelectItem value="unassigned">{t.issues.unassigned}</SelectItem>
                                    {members?.map((member: OrganizationMember) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fecha desde */}
                        <div className="flex-1 min-w-[200px]">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFrom ? (
                                            format(dateFrom, 'PPP', { locale })
                                        ) : (
                                            <span className="text-muted-foreground">{t.issues.from}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateFrom}
                                        onSelect={handleDateFromChange}
                                        initialFocus
                                        locale={locale}
                                    />
                                    {dateFrom && (
                                        <div className="p-3 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDateFromChange(undefined)}
                                                className="w-full"
                                            >
                                                {t.common.clear}
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Fecha hasta */}
                        <div className="flex-1 min-w-[200px]">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateTo ? (
                                            format(dateTo, 'PPP', { locale })
                                        ) : (
                                            <span className="text-muted-foreground">{t.issues.to}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateTo}
                                        onSelect={handleDateToChange}
                                        initialFocus
                                        locale={locale}
                                        disabled={(date) =>
                                            dateFrom ? date < dateFrom : false
                                        }
                                    />
                                    {dateTo && (
                                        <div className="p-3 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDateToChange(undefined)}
                                                className="w-full"
                                            >
                                                {t.common.clear}
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
