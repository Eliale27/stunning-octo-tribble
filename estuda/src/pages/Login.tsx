import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useStore } from '@/store/useStore'

export default function Login() {
  const loggedIn = useStore(s => s.loggedIn)
  const login = useStore(s => s.login)
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  if (loggedIn) return <Navigate to="/app" replace />

  const enter = (n?: string) => { login(n); nav('/app') }

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10">
        <Link to="/"><Logo /></Link>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="m-auto w-full max-w-sm py-12">
          <h1 className="text-3xl font-extrabold tracking-tight">Bem-vindo de volta 🌱</h1>
          <p className="mt-2 text-ink-2">Seu espaço está pronto. Entre e continue de onde parou.</p>
          <form className="mt-8 space-y-4" onSubmit={e => { e.preventDefault(); enter(name.trim() || undefined) }}>
            <div><label className="label">Como quer ser chamado?</label><input className="input" placeholder="Eliale" value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className="label">E-mail</label><input type="email" className="input" placeholder="voce@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <button className="btn btn-primary h-12 w-full text-base">Entrar <ArrowRight size={17} /></button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />ou<span className="h-px flex-1 bg-line" /></div>
          <button onClick={() => enter()} className="btn btn-soft h-12 w-full text-base">Explorar com dados de demonstração</button>
          <p className="mt-6 text-center text-xs text-muted">Versão de demonstração: nenhum dado sai do seu navegador.</p>
        </motion.div>
      </div>
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-sage-soft via-sky-soft to-lilac-soft" />
        <div className="absolute inset-0 grid place-items-center p-16">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="max-w-md">
            <div className="card animate-float p-6 shadow-lift">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Hoje</p>
              <p className="mt-1 text-2xl font-extrabold">Você está 80% mais perto da sua meta.</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-beige"><div className="h-full w-4/5 rounded-full bg-sage" /></div>
              <div className="mt-5 flex gap-2 text-xs"><span className="chip bg-peach-soft text-peach-ink">🔥 12 dias seguidos</span><span className="chip bg-butter-soft text-butter-ink">🌿 Criando ritmo</span></div>
            </div>
            <p className="mt-8 text-center text-lg font-semibold text-ink-2">“Não precisa estudar perfeitamente. Precisa continuar.”</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
