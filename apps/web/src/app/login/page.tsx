'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLogin } from '@/hooks/useAuth'
import { useTranslations } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const t = useTranslations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">{t.auth.loginTitle}</CardTitle>
          <CardDescription className="text-center">
            {t.auth.loginDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {login.isError && (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{login.error?.message || t.auth.loginFailed}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t.auth.emailPlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t.auth.passwordPlaceholder}
              />
            </div>

            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full"
            >
              {login.isPending ? (
                t.common.loggingIn
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t.auth.login}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            {t.auth.dontHaveAccount}{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t.auth.register}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

