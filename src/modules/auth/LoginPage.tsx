import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wrench,
  ArrowRight,
  BarChart3,
  Package,
  History,
  Activity,
} from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (usuario === '' && password === '') {
      setAuth(
        {
          id: '1',
          name: 'Usuario Prueba',
          email: 'prueba@tallerp.com',
          role: 'admin',
          companyId: '1',
          companyName: 'Taller Demo',
        },
        'mock-token-prueba'
      )
      navigate('/')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  const features = [
    { title: 'Diagnóstico Vehicular', icon: Activity },
    { title: 'Inventario Inteligente', icon: Package },
    { title: 'Historial de Servicios', icon: History },
    { title: 'Analíticas en Tiempo Real', icon: BarChart3 },
  ]

  return (
    <div className="w-full min-h-screen overflow-hidden bg-gradient-to-br from-[#060E20] via-[#081225] to-[#0A162B] text-white relative flex">

      {/* Ambient Lights */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[140px]" />

      {/* LEFT PANEL */}
      <section className="hidden lg:flex lg:w-[55%] relative overflow-hidden border-r border-white/5 bg-[#081120]">

        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2400&auto=format&fit=crop"
          alt="Workshop"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#060E20] via-[#060E20]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060E20] via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-center px-16 py-20 max-w-2xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 w-fit mb-8">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Plataforma Inteligente para Talleres
          </div>

          <h1 className="text-6xl font-black leading-tight tracking-tight mb-6">
            Gestiona tu taller de forma{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              inteligente
            </span>
          </h1>

          <p className="text-lg leading-relaxed text-slate-300 mb-12">
            Controla diagnósticos, inventario, órdenes de servicio
            y rendimiento operativo desde una sola plataforma moderna.
          </p>

          <div className="grid grid-cols-2 gap-5 mb-14">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/10">
                      <Icon size={22} className="text-cyan-300" />
                    </div>
                    <p className="font-semibold text-white">{feature.title}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-2xl opacity-40" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=2400&auto=format&fit=crop"
                alt="Dashboard"
                className="w-full opacity-90"
              />
            </div>
          </div>

        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="flex flex-1 items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-md">

          <div className="flex flex-col items-center mb-10">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.35)]">
              <Wrench className="text-white" size={34} />
            </div>
            <h2 className="text-4xl font-black tracking-tight">tallERP</h2>
            <p className="mt-3 text-sm text-slate-400">Plataforma de gestión automotriz</p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-900/70 backdrop-blur-2xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">

            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido de nuevo</h1>
              <p className="text-slate-400">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Usuario
                </label>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => {
                    setUsuario(e.target.value)
                    setError('')
                  }}
                  placeholder="prueba"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-400/40 focus:bg-white/[0.09] focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-400/40 focus:bg-white/[0.09] focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-4 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] active:scale-[0.99]"
              >
                Entrar
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

            </form>
          </div>
        </div>
      </section>

    </div>
  )
}
