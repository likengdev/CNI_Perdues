import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, AlertCircle, MapPin, Calendar, CreditCard,
  CheckCircle, ImageOff, Clock, RotateCcw, ShieldCheck,
} from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import Pagination from '../../components/admin/Pagination'
import { useListeAdmin } from '../../hooks/useListeAdmin'
import { validerAnnonce, rejeterAnnonce } from '../../api/annonces'
import { extraireMessageErreur } from '../../api/client'

function formaterDate(iso) {
  if (!iso) return '—'
  const [annee, mois, jour] = String(iso).slice(0, 10).split('-')
  if (!annee || !mois || !jour) return iso
  return `${jour}/${mois}/${annee}`
}

const CONFIGS_STATUT = {
  en_attente: {
    libelle: 'En attente',
    Icon: Clock,
    badge: 'bg-amber-50 text-amber-700 border-amber-200/50',
    barre: 'bg-amber-400',
  },
  publiee: {
    libelle: 'Acceptée',
    Icon: Check,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    barre: 'bg-emerald-500',
  },
  rejetee: {
    libelle: 'Rejetée',
    Icon: X,
    badge: 'bg-red-50 text-red-700 border-red-200/50',
    barre: 'bg-red-500',
  },
  en_cours: {
    libelle: 'En restitution',
    Icon: RotateCcw,
    badge: 'bg-violet-50 text-violet-700 border-violet-200/50',
    barre: 'bg-violet-500',
  },
  restituee: {
    libelle: 'Restituée',
    Icon: ShieldCheck,
    badge: 'bg-pink-50 text-pink-700 border-pink-200/50',
    barre: 'bg-pink-500',
  },
}

const configStatut = (statut) =>
  CONFIGS_STATUT[statut] || {
    libelle: (statut || '—').replace(/_/g, ' '),
    Icon: AlertCircle,
    badge: 'bg-slate-50 text-slate-600 border-slate-200/50',
    barre: 'bg-slate-400',
  }

function PhotoTitulaire({ url }) {
  const [manquante, setManquante] = useState(!url)

  if (!url || manquante) {
    return (
      <div className="h-32 w-28 shrink-0 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-400">
        <ImageOff size={20} />
        <span className="text-[10px] font-medium px-1 text-center">Photo de l'individu indisponible</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt="Photo de l'individu"
      loading="lazy"
      onError={() => setManquante(true)}
      className="h-32 w-28 shrink-0 object-cover rounded-xl border border-slate-200 bg-slate-100"
    />
  )
}

function PanneauStatut({ statut, motif }) {
  const config = configStatut(statut)

  const contenus = {
    publiee: {
      titre: 'Transférée dans les annonces publiées',
      sousTitre: 'La carte est visible par le public et tracée dans l\u2019historique.',
    },
    rejetee: {
      titre: 'Annonce rejetée',
      sousTitre: motif ? `Motif : ${motif}` : 'Motif non renseigné.',
    },
    en_cours: {
      titre: 'En cours de restitution',
      sousTitre: 'Une mise en relation est active pour cette carte.',
    },
    restituee: {
      titre: 'CNI restituée',
      sousTitre: 'La carte a été remise à son propriétaire. Trace conservée.',
    },
  }

  const contenu = contenus[statut]

  if (!contenu) return null

  return (
    <div className="flex-1 lg:flex-none flex flex-col items-center gap-2 rounded-xl border px-5 py-4 text-center min-w-[200px] bg-white/60 border-slate-200">
      <span className="flex h-9 w-9 items-center justify-center rounded-full text-white bg-slate-400">
        <config.Icon size={16} />
      </span>
      <p className="text-xs font-semibold text-slate-700">{contenu.titre}</p>
      <p className="text-[11px] text-slate-500 leading-snug">{contenu.sousTitre}</p>
    </div>
  )
}

function AnnoncesEnAttente() {
  const { donnees, chargement, erreur, suivant, precedent, allerSuivant, allerPrecedent } = useListeAdmin('/admin/annonces/')
  const [motifs, setMotifs] = useState({})
  const [ligneOuverte, setLigneOuverte] = useState(null)
  const [succes, setSucces] = useState('')
  const [messageAction, setMessageAction] = useState('')
  const [decisions, setDecisions] = useState({})

  const statutEffectif = (a) => decisions[a.id] || a.statut || 'en_attente'

  const nombreEnAttente = (donnees || []).filter((a) => statutEffectif(a) === 'en_attente').length
  const nombreAcceptees = (donnees || []).filter((a) => ['publiee', 'en_cours', 'restituee'].includes(statutEffectif(a))).length
  const nombreRejetees = (donnees || []).filter((a) => statutEffectif(a) === 'rejetee').length

  const valider = async (id) => {
    setSucces('')
    setMessageAction('')
    try {
      await validerAnnonce(id)
      setDecisions((precedent) => ({ ...precedent, [id]: 'publiee' }))
      setSucces('Annonce acceptée avec succès. Elle reste affichée ici avec le statut « Acceptée ».')
    } catch (err) {
      setMessageAction(extraireMessageErreur(err, 'Impossible de valider cette annonce.'))
    }
  }

  const rejeter = async (id) => {
    const motif = (motifs[id] || '').trim()
    if (!motif) { setMessageAction('Le motif de rejet est obligatoire.'); return }
    setSucces('')
    setMessageAction('')
    try {
      await rejeterAnnonce(id, motif)
      setLigneOuverte(null)
      setDecisions((precedent) => ({ ...precedent, [id]: 'rejetee' }))
      setSucces('Annonce rejetée avec succès. Elle reste affichée ici avec le statut « Rejetée ».')
    } catch (err) {
      setMessageAction(extraireMessageErreur(err, 'Impossible de rejeter cette annonce.'))
    }
  }

  return (
    <MiseEnPageAdmin titre="Annonces en attente">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Validation des annonces</h1>
            <p className="text-slate-500 mt-1">
              Registre complet : chaque annonce reste visible ici avec son statut réel.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 bg-amber-50 text-amber-700 font-semibold text-sm rounded-xl border border-amber-200/50 flex items-center space-x-2">
              <Clock size={16} />
              <span>{nombreEnAttente} en attente</span>
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-xl border border-emerald-200/50 flex items-center space-x-2">
              <CheckCircle size={16} />
              <span>{nombreAcceptees} acceptée{nombreAcceptees > 1 ? 's' : ''}</span>
            </div>
            {nombreRejetees > 0 && (
              <div className="px-4 py-2 bg-red-50 text-red-700 font-semibold text-sm rounded-xl border border-red-200/50 flex items-center space-x-2">
                <X size={16} />
                <span>{nombreRejetees} rejetée{nombreRejetees > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {erreur && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 text-sm rounded-2xl px-6 py-4 border border-red-100 mb-6 flex items-center space-x-3 shadow-sm">
            <AlertCircle size={20} />
            <span>{erreur}</span>
          </motion.div>
        )}

        {succes && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 text-emerald-700 text-sm rounded-2xl px-6 py-4 border border-emerald-100 mb-6 flex items-center space-x-3 shadow-sm">
            <CheckCircle size={20} />
            <span>{succes}</span>
          </motion.div>
        )}

        {messageAction && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 text-sm rounded-2xl px-6 py-4 border border-red-100 mb-6 flex items-center space-x-3 shadow-sm">
            <AlertCircle size={20} />
            <span>{messageAction}</span>
          </motion.div>
        )}

        {chargement ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Chargement des annonces...</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <AnimatePresence>
                {donnees.map((a, index) => {
                  const statut = statutEffectif(a)
                  const config = configStatut(statut)
                  const motif = a.motif_rejet || motifs[a.id] || ''

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      key={a.id}
                      className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full ${config.barre}`}></div>

                      <div className="flex flex-col lg:flex-row items-start gap-6 pl-2">
                        <PhotoTitulaire url={a.photo_titulaire} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-4">
                            <h3 className="text-xl font-bold text-slate-800">{a.prenom_titulaire} {a.nom_titulaire}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.badge}`}>
                              <config.Icon size={14} /> {config.libelle}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
                            <div className="flex items-center text-sm text-slate-600">
                              <CreditCard size={14} className="mr-2 text-slate-400 shrink-0" />
                              <span className="truncate">N° CNI : <span className="font-semibold text-slate-700">{a.numero_carte}</span></span>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                              <Calendar size={14} className="mr-2 text-slate-400 shrink-0" />
                              <span>Né(e) le {formaterDate(a.date_naissance)}</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                              <MapPin size={14} className="mr-2 text-slate-400 shrink-0" />
                              <span className="truncate">Lieu de naissance : {a.lieu_naissance}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
                          {statut === 'en_attente' ? (
                            <>
                              <button
                                onClick={() => valider(a.id)}
                                className="flex-1 lg:flex-none flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                              >
                                <Check size={16} className="mr-2" /> Accepter
                              </button>
                              <button
                                onClick={() => setLigneOuverte(ligneOuverte === a.id ? null : a.id)}
                                className={`flex-1 lg:flex-none flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl transition-all ${
                                  ligneOuverte === a.id
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                                }`}
                              >
                                <X size={16} className="mr-2" /> Rejeter
                              </button>
                            </>
                          ) : (
                            <PanneauStatut statut={statut} motif={motif} />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {ligneOuverte === a.id && statut === 'en_attente' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 pl-2">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  placeholder="Veuillez indiquer le motif du rejet..."
                                  value={motifs[a.id] || ''}
                                  onChange={(e) => setMotifs((prec) => ({ ...prec, [a.id]: e.target.value }))}
                                  className="w-full pl-4 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all"
                                />
                              </div>
                              <button
                                onClick={() => rejeter(a.id)}
                                className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20 transition-all shrink-0"
                              >
                                Confirmer le rejet
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {donnees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                <CheckCircle size={48} className="mx-auto text-amber-400 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Aucune annonce pour le moment.</p>
                <p className="text-sm mt-1">Les annonces apparaîtront ici dès leur soumission.</p>
              </div>
            )}

            <Pagination suivant={suivant} precedent={precedent} onSuivant={allerSuivant} onPrecedent={allerPrecedent} />
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  )
}

export default AnnoncesEnAttente
