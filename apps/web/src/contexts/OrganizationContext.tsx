'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface OrganizationContextType {
    activeOrgId: string | null
    setActiveOrgId: (orgId: string | null) => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('activeOrgId')
        if (stored) {
            setActiveOrgIdState(stored)
        }
    }, [])

    const setActiveOrgId = (orgId: string | null) => {
        setActiveOrgIdState(orgId)
        if (orgId) {
            localStorage.setItem('activeOrgId', orgId)
        } else {
            localStorage.removeItem('activeOrgId')
        }
    }

    return (
        <OrganizationContext.Provider value={{ activeOrgId, setActiveOrgId }}>
            {children}
        </OrganizationContext.Provider>
    )
}

export function useOrganization() {
    const context = useContext(OrganizationContext)
    if (context === undefined) {
        throw new Error('useOrganization must be used within OrganizationProvider')
    }
    return context
}
