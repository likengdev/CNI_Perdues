import { useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, AlertCircle, CheckCircle2, Clock, Calendar } from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import Tableau from '../../components/admin/Tableau'
import Pagination from '../../components/admin/Pagination'
import { useListeAdmin } from '../../hooks/useListeAdmin'
import { cloturerMiseEnRelation } from '../../api/miseEnRelation'
import { extraireMessageErreur } from '../../api/client'

function RestitutionsEnCours() {
  const { donnees, chargement, erreur, suivant, precedent, allerSuivant, allerPrecedent, recharger } = useListeAdmin('/admin/restitutions/?etat=en_cours')
  const [messageAction, setMessageAction] = useState('')

  const cloturer = async (id) => {
    setMessageAction('')
    try {
      await cloturerMiseEnRelation(id)
      recharger()
    } catch (err) {
      setMessageAction(extraireMessageErreur(err, 'Impossible de clôturer cette restitution.'))
    }
  }

  return (
    <MiseEnPageAdmin titre="Restitutions en cours">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Restitutions en cours</h1>
            <p className="text-slate-500 mt-1">Gérez les mises en relation actives entre déclarants et bénéficiaires.</p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold text-sm rounded-xl border border-indigo-200/50 flex items-center space-x-2">
            <RotateCcw size={16} />
            <span>{donnees?.length || 0} en cours</span>
          </div>
        </div>

        {erreur && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 text-sm rounded-2xl px-6 py-4 border border-red-100 mb-6 flex items-center space-x-3 shadow-sm">
            <AlertCircle size={20} />
            <span>{erreur}</span>
          </motion.div>
        )}
        
        {messageAction && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 text-emerald-700 text-sm rounded-2xl px-6 py-4 border border-emerald-100 mb-6 flex items-center space-x-3 shadow-sm">
            <CheckCircle2 size={20} />
            <span>{messageAction}</span>
          </motion.div>
        )}

        {chargement ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Chargement...</p>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Tableau colonnes={['Annonce / CNI', 'Bénéficiaire', 'Confirmation', 'Expire le', 'Action']}>
                {donnees.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                    <td className="px-6 py-4 pl-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {m.annonce?.prenom_titulaire?.charAt(0)}{m.annonce?.nom_titulaire?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{m.annonce?.prenom_titulaire} {m.annonce?.nom_titulaire}</p>
                          <p className="text-[11px] text-slate-400 font-medium">Annonce #{m.annonce?.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{m.beneficiaire?.prenom} {m.beneficiaire?.nom}</p>
                      <p className="text-[11px] text-slate-500 whitespace-nowrap">{m.beneficiaire?.telephone || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${m.confirmation_beneficiaire ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' : 'bg-amber-50 text-amber-600 border-amber-200/50'}`}>
                        {m.confirmation_beneficiaire ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        <span>{m.confirmation_beneficiaire ? 'Confirmée' : 'En attente'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-700">
                            {m.date_expiration ? new Date(m.date_expiration).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {m.date_expiration ? new Date(m.date_expiration).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => cloturer(m.id)}
                        disabled={!m.confirmation_beneficiaire}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-all disabled:opacity-50 disabled:hover:bg-brand-500 disabled:cursor-not-allowed shadow-sm shadow-brand-500/20"
                      >
                        Clôturer
                      </button>
                    </td>
                  </tr>
                ))}
              </Tableau>
            </motion.div>
            
            {donnees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-4">
                <RotateCcw size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Aucune restitution en cours.</p>
              </div>
            )}
            
            <Pagination suivant={suivant} precedent={precedent} onSuivant={allerSuivant} onPrecedent={allerPrecedent} />
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  )
}

export default RestitutionsEnCours