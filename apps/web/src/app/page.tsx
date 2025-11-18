'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Users, Zap, Shield } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

export default function HomePage() {
  const t = useTranslations()

  const features = [
    {
      icon: CheckCircle2,
      title: t.home.features.organize.title,
      description: t.home.features.organize.description,
    },
    {
      icon: Users,
      title: t.home.features.collaborate.title,
      description: t.home.features.collaborate.description,
    },
    {
      icon: Zap,
      title: t.home.features.productive.title,
      description: t.home.features.productive.description,
    },
    {
      icon: Shield,
      title: t.home.features.secure.title,
      description: t.home.features.secure.description,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">
            {t.home.hero.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t.home.hero.subtitle}
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                {t.home.hero.getStarted}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                {t.home.hero.signIn}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">{t.home.cta.title}</CardTitle>
              <CardDescription className="text-base">
                {t.home.cta.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register">
                <Button size="lg" className="px-8">
                  {t.home.cta.button}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
