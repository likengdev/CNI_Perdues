import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, ChevronDown, Clock } from 'lucide-react'
import { useAdmin } from '../../contexte/ContexteAdmin'

function BarreSuperieure({ titre = 'Tableau de bord' }) {
  const { deconnecter, admin } = useAdmin()
  const navigue = useNavigate()
  const [heureActuelle, setHeureActuelle] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setHeureActuelle(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const initiales = (admin?.nom || '')
    .trim()
    .split(/\s+/)
    .map((partie) => partie[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD'

  const seDeconnecter = () => {
    deconnecter()
    navigue('/admin/connexion')
  }

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-30 transition-all shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{titre}</h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-2 bg-slate-100/50 px-4 py-2 rounded-full border border-slate-200/50 shadow-inner">
          <Clock className="text-brand-500 w-4 h-4" />
          <span className="text-sm font-semibold tracking-wider text-slate-700 font-mono">
            {heureActuelle.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center space-x-3 ml-2 cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/20 group-hover:shadow-lg transition-all">
              {initiales}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-600 transition-colors">{admin?.nom || 'Administrateur'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Superadmin</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
          </div>

          <button 
            onClick={seDeconnecter} 
            title="Se déconnecter"
            className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default BarreSuperieure