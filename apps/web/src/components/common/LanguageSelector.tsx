'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
]

export function LanguageSelector() {
    const [currentLang, setCurrentLang] = useState('es')

    useEffect(() => {
        const saved = localStorage.getItem('language') || 'es'
        setCurrentLang(saved)
        document.documentElement.lang = saved
    }, [])

    const handleLanguageChange = (lang: string) => {
        setCurrentLang(lang)
        localStorage.setItem('language', lang)
        document.documentElement.lang = lang
        window.location.reload()
    }

    return (
        <Select value={currentLang} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
