'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRegister } from '@/hooks/useAuth'
import { useTranslations } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const register = useRegister()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const t = useTranslations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({ email, password, name })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">{t.auth.registerTitle}</CardTitle>
          <CardDescription className="text-center">
            {t.auth.registerDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {register.isError && (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{register.error?.message || t.auth.registerFailed}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t.auth.fullName}</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t.auth.namePlaceholder}
              />
            </div>

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
                minLength={6}
                placeholder={t.auth.passwordPlaceholder}
              />
            </div>

            <Button
              type="submit"
              disabled={register.isPending}
              className="w-full"
            >
              {register.isPending ? (
                t.common.creatingAccount
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t.auth.register}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            {t.auth.alreadyHaveAccount}{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t.auth.login}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

