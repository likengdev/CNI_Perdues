import { motion } from 'framer-motion'
import { UserCheck, AlertCircle } from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import Tableau from '../../components/admin/Tableau'
import Pagination from '../../components/admin/Pagination'
import { useListeAdmin } from '../../hooks/useListeAdmin'

function ListeBeneficiaires() {
  const { donnees, chargement, erreur, suivant, precedent, allerSuivant, allerPrecedent } = useListeAdmin('/admin/beneficiaires/')

  return (
    <MiseEnPageAdmin titre="Bénéficiaires">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Liste des bénéficiaires</h1>
            <p className="text-slate-500 mt-1">Personnes ayant réclamé ou récupéré leurs cartes d'identité.</p>
          </div>
          <div className="px-4 py-2 bg-teal-50 text-teal-700 font-semibold text-sm rounded-xl border border-teal-200/50 flex items-center space-x-2">
            <UserCheck size={16} />
            <span>{donnees?.length || 0} bénéficiaires</span>
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
            <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Chargement des bénéficiaires...</p>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Tableau colonnes={['Bénéficiaire', 'Téléphone']}>
                {donnees.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                    <td className="px-6 py-4 pl-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.prenom} {u.nom}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{u.telephone}</td>
                  </tr>
                ))}
              </Tableau>
            </motion.div>
            
            {donnees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-4">
                <UserCheck size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Aucun bénéficiaire.</p>
              </div>
            )}
            
            <Pagination suivant={suivant} precedent={precedent} onSuivant={allerSuivant} onPrecedent={allerPrecedent} />
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  )
}

export default ListeBeneficiaires