'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
    id: string
    email: string
    name: string
    avatarUrl?: string | null
    currentOrgId?: string | null
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    logout: () => void
}

export function useAuth(): AuthContextType {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('accessToken')
            const userStr = localStorage.getItem('user')

            if (token && userStr) {
                try {
                    const userData = JSON.parse(userStr)
                    setUser(userData)
                } catch (error) {
                    console.error('Error parsing user data:', error)
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('user')
                }
            }

            setIsLoading(false)
        }

        checkAuth()
    }, [])

    const logout = () => {
        // Limpiar localStorage inmediatamente
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        localStorage.removeItem('activeOrgId')
        setUser(null)

        // Intentar notificar al servidor en background (no esperamos)
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => {
            // Ignorar errores ya que el logout local ya se completó
            console.debug('Logout API call failed, but local logout succeeded')
        })

        // Redirigir inmediatamente usando window.location para forzar recarga completa
        window.location.href = '/login'
    }

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
    }
}

interface AuthGuardProps {
    children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/', '/login', '/register']

    useEffect(() => {
        if (!isLoading) {
            const isPublicRoute = publicRoutes.includes(pathname)

            if (!isAuthenticated && !isPublicRoute) {
                // Usuario no autenticado intentando acceder a ruta protegida
                router.push('/login')
            } else if (isAuthenticated && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
                // Usuario autenticado intentando acceder a login/register o home
                router.push('/dashboard')
            }
        }
    }, [isAuthenticated, isLoading, pathname, router])

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg text-muted-foreground">Loading...</div>
            </div>
        )
    }

    // Si es una ruta pública o el usuario está autenticado, mostrar el contenido
    const isPublicRoute = publicRoutes.includes(pathname)
    if (isPublicRoute || isAuthenticated) {
        return <>{children}</>
    }

    // En cualquier otro caso, mostrar loading (mientras redirige)
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-lg text-muted-foreground">Redirecting...</div>
        </div>
    )
}
