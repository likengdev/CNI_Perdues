import { motion } from 'framer-motion'
import { Activity, AlertCircle, CalendarDays } from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import Tableau from '../../components/admin/Tableau'
import Pagination from '../../components/admin/Pagination'
import { useListeAdmin } from '../../hooks/useListeAdmin'

const LIBELLES_ACTION = {
  publication: 'Publication',
  validation: 'Validation',
  rejet: 'Rejet',
  consultation: 'Consultation',
  restitution: 'Restitution',
  inscription: 'Inscription',
  autre: 'Autre',
}

const STYLES_ACTION = {
  publication: 'bg-sky-50 text-sky-700 border-sky-200',
  validation: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejet: 'bg-red-50 text-red-700 border-red-200',
  consultation: 'bg-slate-100 text-slate-600 border-slate-200',
  restitution: 'bg-violet-50 text-violet-700 border-violet-200',
  inscription: 'bg-teal-50 text-teal-700 border-teal-200',
  autre: 'bg-slate-100 text-slate-600 border-slate-200',
}

const libelleAction = (cle) => LIBELLES_ACTION[cle] || (cle || '—')

const formaterDate = (valeur) => {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formaterHeure = (valeur) => {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function HistoriqueActivites() {
  const { donnees, chargement, erreur, suivant, precedent, allerSuivant, allerPrecedent } = useListeAdmin('/admin/historique/')

  return (
    <MiseEnPageAdmin titre="Historique">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Historique des activités</h1>
            <p className="text-slate-500 mt-1">Trace de toutes les actions et modifications effectuées sur la plateforme.</p>
          </div>
          <div className="px-4 py-2 bg-white text-slate-700 font-semibold text-sm rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-2">
            <Activity size={16} className="text-brand-500" />
            <span>Journal complet · {donnees.length} entrée{donnees.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {erreur && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 text-sm rounded-2xl px-6 py-4 border border-red-100 mb-6 flex items-center space-x-3 shadow-sm">
            <AlertCircle size={20} />
            <span>{erreur}</span>
          </motion.div>
        )}
        
        {chargement ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Chargement de l'historique...</p>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Tableau colonnes={['Utilisateur', "Type d'action", 'Description', 'Date']}>
                {donnees.map((h) => (
                  <tr key={h.id} className="hover:bg-brand-50/40 transition-colors">
                    <td className="px-6 py-4 pl-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold text-[11px] shadow-sm shadow-brand-500/20 shrink-0">
                          {(h.utilisateur_prenom || '').charAt(0)}{(h.utilisateur_nom || '').charAt(0)}
                        </div>
                        <p className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {[h.utilisateur_prenom, h.utilisateur_nom].filter(Boolean).join(' ') || 'Utilisateur inconnu'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full border uppercase tracking-wide ${STYLES_ACTION[h.type_action] || STYLES_ACTION.autre}`}>
                        {libelleAction(h.type_action)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 max-w-[320px] truncate" title={h.description}>
                        {h.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                        <CalendarDays size={15} className="text-brand-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-700">{formaterDate(h.date_creation)}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{formaterHeure(h.date_creation)}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </Tableau>
            </motion.div>
            
            {donnees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-4">
                <Activity size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Aucune activité récente.</p>
              </div>
            )}
            
            <Pagination suivant={suivant} precedent={precedent} onSuivant={allerSuivant} onPrecedent={allerPrecedent} />
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  )
}

export default HistoriqueActivites
