import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, FileText, BadgeCheck, RotateCcw, ShieldCheck, ImageOff } from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import Tableau from '../../components/admin/Tableau'
import Pagination from '../../components/admin/Pagination'
import { useListeAdmin } from '../../hooks/useListeAdmin'

const LIBELLES_STATUT = {
  publiee: { libelle: 'Publiée', Icon: BadgeCheck, classes: 'bg-emerald-50 text-emerald-600 border-emerald-200/50' },
  en_cours: { libelle: 'En restitution', Icon: RotateCcw, classes: 'bg-violet-50 text-violet-600 border-violet-200/50' },
  restituee: { libelle: 'Restituée', Icon: ShieldCheck, classes: 'bg-pink-50 text-pink-600 border-pink-200/50' },
}

function BadgeStatut({ statut }) {
  const config = LIBELLES_STATUT[statut] || { libelle: statut || '—', Icon: CheckCircle, classes: 'bg-slate-50 text-slate-600 border-slate-200/50' }
  const Icon = config.Icon
  return (
    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${config.classes}`}>
      <Icon size={14} />
      <span>{config.libelle}</span>
    </div>
  )
}

function PhotoIndividu({ url }) {
  const [manquante, setManquante] = useState(!url)

  if (!url || manquante) {
    return (
      <div className="h-14 w-12 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center" title="Photo de l'individu indisponible">
        <ImageOff size={16} className="text-slate-300" />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt="Photo de l'individu"
      loading="lazy"
      onError={() => setManquante(true)}
      className="h-14 w-12 rounded-lg object-cover border border-slate-200 bg-slate-100"
    />
  )
}

function AnnoncesPubliees() {
  const { donnees, chargement, erreur, suivant, precedent, allerSuivant, allerPrecedent } = useListeAdmin('/admin/annonces/?statut=publiee,en_cours,restituee')

  return (
    <MiseEnPageAdmin titre="Annonces publiées">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Historique des annonces publiées</h1>
            <p className="text-slate-500 mt-1">
              Registre complet : les annonces restent tracées ici même après leur restitution.
            </p>
          </div>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-xl border border-emerald-200/50 flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>{donnees?.length || 0} annonce{donnees?.length > 1 ? 's' : ''}</span>
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
              <Tableau colonnes={['Photo', 'Titulaire de la CNI', 'Déclarant', 'Position signalée', 'Date de publication', 'Statut']}>
                {donnees.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                    <td className="px-6 py-4 pl-8">
                      <PhotoIndividu url={a.photo_titulaire} />
                    </td>
                    <td className="px-6 py-4">
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
                      <span className="text-sm text-slate-500 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200/50 whitespace-nowrap">
                        {new Date(a.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <BadgeStatut statut={a.statut} />
                    </td>
                  </tr>
                ))}
              </Tableau>
            </motion.div>
            
            {donnees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-4">
                <CheckCircle size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Aucune annonce publiée pour le moment.</p>
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
