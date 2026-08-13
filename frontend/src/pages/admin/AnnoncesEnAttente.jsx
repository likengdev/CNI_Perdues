import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, FileText, MapPin, Calendar, CreditCard, CheckCircle } from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import Pagination from '../../components/admin/Pagination'
import { useListeAdmin } from '../../hooks/useListeAdmin'
import { validerAnnonce, rejeterAnnonce } from '../../api/annonces'
import { extraireMessageErreur } from '../../api/client'

function AnnoncesEnAttente() {
  const { donnees, chargement, erreur, suivant, precedent, allerSuivant, allerPrecedent, recharger } = useListeAdmin('/admin/annonces/?statut=en_attente')
  const [motifs, setMotifs] = useState({})
  const [ligneOuverte, setLigneOuverte] = useState(null)
  const [messageAction, setMessageAction] = useState('')

  const valider = async (id) => {
    setMessageAction('')
    try {
      await validerAnnonce(id)
      recharger()
    } catch (err) {
      setMessageAction(extraireMessageErreur(err, 'Impossible de valider cette annonce.'))
    }
  }

  const rejeter = async (id) => {
    const motif = (motifs[id] || '').trim()
    if (!motif) { setMessageAction('Le motif de rejet est obligatoire.'); return }
    setMessageAction('')
    try {
      await rejeterAnnonce(id, motif)
      setLigneOuverte(null)
      recharger()
    } catch (err) {
      setMessageAction(extraireMessageErreur(err, 'Impossible de rejeter cette annonce.'))
    }
  }

  return (
    <MiseEnPageAdmin titre="Annonces en attente">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Validation des annonces</h1>
            <p className="text-slate-500 mt-1">Examinez et validez les nouvelles annonces de CNI perdues ou retrouvées.</p>
          </div>
          <div className="px-4 py-2 bg-amber-50 text-amber-700 font-semibold text-sm rounded-xl border border-amber-200/50 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{donnees?.length || 0} en attente</span>
          </div>
        </div>

        {erreur && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 text-sm rounded-2xl px-6 py-4 border border-red-100 mb-6 flex items-center space-x-3 shadow-sm">
            <AlertCircle size={20} />
            <span>{erreur}</span>
          </motion.div>
        )}
        
        {messageAction && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 text-amber-700 text-sm rounded-2xl px-6 py-4 border border-amber-100 mb-6 flex items-center space-x-3 shadow-sm">
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
            <div className="space-y-4">
              <AnimatePresence>
                {donnees.map((a, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    key={a.id} 
                    className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-2">
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                            {a.prenom_titulaire.charAt(0)}{a.nom_titulaire.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">{a.prenom_titulaire} {a.nom_titulaire}</h3>
                            <p className="text-xs font-medium text-slate-400">Soumis par: {a.declarant_prenom} {a.declarant_nom}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-4">
                          <div className="flex items-center text-sm text-slate-600">
                            <CreditCard size={14} className="mr-2 text-slate-400" />
                            <span>N° <span className="font-semibold text-slate-700">{a.numero_carte}</span></span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar size={14} className="mr-2 text-slate-400" />
                            <span>Né(e) le {a.date_naissance}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <MapPin size={14} className="mr-2 text-slate-400" />
                            <span>À {a.lieu_naissance}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <FileText size={14} className="mr-2 text-slate-400" />
                            <span>Pos: {a.position_cni} {a.position_precision ? `(${a.position_precision})` : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row lg:flex-col gap-3 shrink-0">
                        <button 
                          onClick={() => valider(a.id)} 
                          className="flex-1 lg:flex-none flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                        >
                          <Check size={16} className="mr-2" /> Valider
                        </button>
                        <button
                          onClick={() => setLigneOuverte(ligneOuverte === a.id ? null : a.id)}
                          className={`flex-1 lg:flex-none flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                            ligneOuverte === a.id 
                              ? 'bg-slate-100 text-slate-700' 
                              : 'border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                          }`}
                        >
                          <X size={16} className="mr-2" /> Rejeter
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {ligneOuverte === a.id && (
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
                ))}
              </AnimatePresence>
            </div>
            
            {donnees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Tout est à jour !</p>
                <p className="text-sm mt-1">Aucune annonce en attente de validation.</p>
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