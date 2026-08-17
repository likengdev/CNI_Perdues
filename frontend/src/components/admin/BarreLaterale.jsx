import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, UserPlus, UserCheck,
  Clock, CheckCircle, RotateCcw, ShieldCheck, Activity, X
} from 'lucide-react'

const GROUPES_LIENS = [
  {
    titre: "Général",
    liens: [
      { chemin: '/admin', libelle: 'Tableau de bord', icon: LayoutDashboard },
    ]
  },
  {
    titre: "Comptes",
    liens: [
      { chemin: '/admin/utilisateurs', libelle: 'Utilisateurs', icon: Users },
      { chemin: '/admin/declarants', libelle: 'Déclarants', icon: UserPlus },
      { chemin: '/admin/beneficiaires', libelle: 'Bénéficiaires', icon: UserCheck },
    ]
  },
  {
    titre: "Annonces",
    liens: [
      { chemin: '/admin/annonces/en-attente', libelle: 'En attente', icon: Clock },
      { chemin: '/admin/annonces/publiees', libelle: 'Publiées', icon: CheckCircle },
    ]
  },
  {
    titre: "Restitutions",
    liens: [
      { chemin: '/admin/restitutions/en-cours', libelle: 'En cours', icon: RotateCcw },
      { chemin: '/admin/restitutions/terminees', libelle: 'Terminées', icon: ShieldCheck },
    ]
  },
  {
    titre: "Système",
    liens: [
      { chemin: '/admin/historique', libelle: 'Historique', icon: Activity },
    ]
  }
]

function ContenuBarreLaterale({ onFermer }) {
  return (
    <>
      <div className="flex items-center justify-between px-3 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-white font-bold text-sm">ID</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight block">IDFinder</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">Espace Admin</span>
          </div>
        </div>
        {onFermer && (
          <button
            onClick={onFermer}
            aria-label="Fermer le menu"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-8">
        {GROUPES_LIENS.map((groupe, index) => (
          <div key={index}>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {groupe.titre}
            </h3>
            <div className="space-y-1">
              {groupe.liens.map((lien) => {
                const Icon = lien.icon
                return (
                  <NavLink
                    key={lien.chemin}
                    to={lien.chemin}
                    end={lien.chemin === '/admin'}
                    onClick={onFermer}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                        isActive
                          ? 'text-white bg-brand-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="active-nav-bg"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full"
                          />
                        )}
                        <Icon size={18} className={`transition-colors ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span>{lien.libelle}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-8 px-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-300">Besoin d'aide ?</p>
          <p className="text-[10px] text-slate-500 mt-1 mb-3">Consultez la documentation technique.</p>
          <button className="w-full text-xs py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium">
            Documentation
          </button>
        </div>
      </div>
    </>
  )
}

function BarreLaterale({ ouvert = false, onFermer }) {
  return (
    <>
      {/* Sidebar fixe sur desktop */}
      <aside className="hidden lg:flex w-[280px] shrink-0 bg-[#0B1120] min-h-screen px-4 py-6 flex-col border-r border-white/10 sticky top-0 h-screen overflow-y-auto custom-scrollbar">
        <ContenuBarreLaterale />
      </aside>

      {/* Tiroir sur mobile / tablette */}
      <AnimatePresence>
        {ouvert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onFermer}
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-[#0B1120] px-4 py-6 flex flex-col overflow-y-auto custom-scrollbar border-r border-white/10 lg:hidden"
            >
              <ContenuBarreLaterale onFermer={onFermer} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default BarreLaterale
