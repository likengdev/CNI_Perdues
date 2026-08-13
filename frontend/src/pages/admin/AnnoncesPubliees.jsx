import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, FileText, BadgeCheck } from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import Tableau from '../../components/admin/Tableau'
import Pagination from '../../components/admin/Pagination'
import { useListeAdmin } from '../../hooks/useListeAdmin'

function AnnoncesPubliees() {
  const { donnees, chargement, erreur, suivant, precedent, allerSuivant, allerPrecedent } = useListeAdmin('/admin/annonces/?statut=publiee')

  return (
    <MiseEnPageAdmin titre="Annonces publiées">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Annonces publiées</h1>
            <p className="text-slate-500 mt-1">Consultez l'historique des annonces validées et visibles par le public.</p>
          </div>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-xl border border-emerald-200/50 flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>{donnees?.length || 0} résultats</span>
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
            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Chargement des annonces...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Tableau colonnes={['Titulaire de la CNI', 'Déclarant', 'Position signalée', 'Date de publication', 'Statut']}>
                {donnees.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                    <td className="px-6 py-4 pl-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          {a.prenom_titulaire.charAt(0)}{a.nom_titulaire.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{a.prenom_titulaire} {a.nom_titulaire}</p>
                          <p className="text-[11px] text-slate-400 font-medium">N° {a.numero_carte}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 font-medium whitespace-nowrap">{a.declarant_prenom} {a.declarant_nom}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <FileText size={14} className="mr-2 text-slate-400 group-hover:text-brand-400 transition-colors shrink-0" />
                        <span className="truncate max-w-[220px]" title={a.position_cni}>{a.position_cni}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200/50">
                        {new Date(a.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200/50">
                        <BadgeCheck size={14} />
                        <span>Publiée</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </Tableau>
            </motion.div>
            
            {donnees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-4">
                <CheckCircle size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Aucune annonce publiée.</p>
              </div>
            )}
            
            <Pagination suivant={suivant} precedent={precedent} onSuivant={allerSuivant} onPrecedent={allerPrecedent} />
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  )
}

export default AnnoncesPubliees