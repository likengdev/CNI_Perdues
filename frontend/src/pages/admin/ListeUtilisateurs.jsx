import { motion } from 'framer-motion'
import { Users, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import Tableau from '../../components/admin/Tableau'
import Pagination from '../../components/admin/Pagination'
import { useListeAdmin } from '../../hooks/useListeAdmin'

function ListeUtilisateurs() {
  const { donnees, chargement, erreur, suivant, precedent, allerSuivant, allerPrecedent } = useListeAdmin('/admin/utilisateurs/')

  return (
    <MiseEnPageAdmin titre="Utilisateurs">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Utilisateurs inscrits</h1>
            <p className="text-slate-500 mt-1">Gérez tous les comptes utilisateurs de la plateforme.</p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold text-sm rounded-xl border border-indigo-200/50 flex items-center space-x-2">
            <Users size={16} />
            <span>{donnees?.length || 0} utilisateurs</span>
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
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Tableau colonnes={['Utilisateur', 'Téléphone', 'Ville', 'Quartier', 'Statut']}>
                {donnees.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                    <td className="px-6 py-4 pl-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.prenom} {u.nom}</p>
                          <p className="text-[11px] text-slate-400 font-medium">ID: #{u.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{u.telephone}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-[160px]" title={u.ville}>{u.ville || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-[180px]" title={u.quartier}>{u.quartier || '—'}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        u.est_actif 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' 
                          : 'bg-red-50 text-red-600 border-red-200/50'
                      }`}>
                        {u.est_actif ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                        <span>{u.est_actif ? 'Actif' : 'Suspendu'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </Tableau>
            </motion.div>
            
            {donnees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-4">
                <Users size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Aucun utilisateur.</p>
              </div>
            )}
            
            <Pagination suivant={suivant} precedent={precedent} onSuivant={allerSuivant} onPrecedent={allerPrecedent} />
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  )
}

export default ListeUtilisateurs