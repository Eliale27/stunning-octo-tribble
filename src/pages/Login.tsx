import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useStore } from '@/store/useStore'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useT } from '@/i18n'

export default function Login() {
  const loggedIn = useStore(s => s.loggedIn)
  const login = useStore(s => s.login)
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const t = useT()
  if (loggedIn) return <Navigate to="/app" replace />

  const enter = (n?: string) => { login(n); nav('/app') }

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <LanguageSwitcher tour={false} />
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="m-auto w-full max-w-sm py-12">
          <h1 className="text-3xl font-extrabold tracking-tight">{t('app.login.title')}</h1>
          <p className="mt-2 text-ink-2">{t('app.login.sub')}</p>
          <form className="mt-8 space-y-4" onSubmit={e => { e.preventDefault(); enter(name.trim() || undefined) }}>
            <div><label className="label">{t('app.login.nameLabel')}</label><input className="input" placeholder={t('app.login.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className="label">{t('app.login.emailLabel')}</label><input type="email" className="input" placeholder={t('app.login.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} /></div>
            <button className="btn btn-primary h-12 w-full text-base">{t('app.login.enter')} <ArrowRight size={17} /></button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />{t('app.login.or')}<span className="h-px flex-1 bg-line" /></div>
          <button onClick={() => enter()} className="btn btn-soft h-12 w-full text-base">{t('app.login.demo')}</button>
          <p className="mt-6 text-center text-xs text-muted">{t('app.login.note')}</p>
        </motion.div>
      </div>
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-sage-soft via-sky-soft to-lilac-soft" />
        <div className="absolute inset-0 grid place-items-center p-16">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="max-w-md">
            <div className="card animate-float p-6 shadow-lift">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('app.login.cardToday')}</p>
              <p className="mt-1 text-2xl font-extrabold">{t('app.login.cardHeadline')}</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-beige"><div className="h-full w-4/5 rounded-full bg-sage" /></div>
              <div className="mt-5 flex gap-2 text-xs"><span className="chip bg-peach-soft text-peach-ink">{t('app.login.cardStreak')}</span><span className="chip bg-butter-soft text-butter-ink">{t('app.login.cardLevel')}</span></div>
            </div>
            <p className="mt-8 text-center text-lg font-semibold text-ink-2">{t('app.login.quote')}</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
