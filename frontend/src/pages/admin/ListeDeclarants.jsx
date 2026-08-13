import { motion } from 'framer-motion'
import { UserPlus, AlertCircle } from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import Tableau from '../../components/admin/Tableau'
import Pagination from '../../components/admin/Pagination'
import { useListeAdmin } from '../../hooks/useListeAdmin'

function ListeDeclarants() {
  const { donnees, chargement, erreur, suivant, precedent, allerSuivant, allerPrecedent } = useListeAdmin('/admin/declarants/')

  return (
    <MiseEnPageAdmin titre="Déclarants">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Liste des déclarants</h1>
            <p className="text-slate-500 mt-1">Personnes ayant déclaré des cartes d'identité perdues ou retrouvées.</p>
          </div>
          <div className="px-4 py-2 bg-sky-50 text-sky-700 font-semibold text-sm rounded-xl border border-sky-200/50 flex items-center space-x-2">
            <UserPlus size={16} />
            <span>{donnees?.length || 0} déclarants</span>
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
            <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Chargement des déclarants...</p>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Tableau colonnes={['Déclarant', 'Téléphone', 'Ville', 'Quartier']}>
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
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-[160px]" title={u.ville}>{u.ville || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-[180px]" title={u.quartier}>{u.quartier || '—'}</td>
                  </tr>
                ))}
              </Tableau>
            </motion.div>
            
            {donnees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-4">
                <UserPlus size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Aucun déclarant.</p>
              </div>
            )}
            
            <Pagination suivant={suivant} precedent={precedent} onSuivant={allerSuivant} onPrecedent={allerPrecedent} />
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  )
}

export default ListeDeclarants