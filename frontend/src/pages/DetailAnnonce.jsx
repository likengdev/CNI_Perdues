import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FondLumineux, CarteEtape, EnteteEtape } from '../components/annonces/ComposantsParcours'
import { declencherMiseEnRelation } from '../api/miseEnRelation'
import { verifierTelephone, inscrireBeneficiaire } from '../api/utilisateurs'
import { extraireMessageErreur } from '../api/client'
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Phone,
  User,
  Sparkles,
  Lock,
  ImageOff,
} from 'lucide-react'

const REGEX_TELEPHONE_CM = /^6\d{8}$/

function validerTelephone(valeur) {
  if (!REGEX_TELEPHONE_CM.test(valeur)) {
    return 'Le numéro doit contenir 9 chiffres et commencer par 6 (ex : 699000000).'
  }
  return ''
}

function formaterDatePublication(valeur) {
  if (!valeur) return '—'
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return String(valeur)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function PhotoTitulaire({ url, prenom, nom }) {
  const [manquante, setManquante] = useState(!url)

  if (!url || manquante) {
    return (
      <div className="h-60 w-44 rounded-3xl border-2 border-dashed border-brand-200/60 bg-gradient-to-br from-brand-50/50 to-slate-50 flex flex-col items-center justify-center gap-2 text-brand-300">
        <ImageOff size={30} strokeWidth={1.5} />
        <span className="text-[11px] font-medium px-2 text-center">Photo indisponible</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={`Photo de ${prenom} ${nom}`}
      onError={() => setManquante(true)}
      className="h-60 w-44 rounded-3xl object-cover border-4 border-white shadow-glow-lg bg-slate-100"
    />
  )
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
}

function DetailAnnonce() {
  const { state } = useLocation()
  const navigue = useNavigate()

  const annonce = state?.annonce

  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [etapeModale, setEtapeModale] = useState('telephone')
  const [telephone, setTelephone] = useState('')
  const [erreurTelephone, setErreurTelephone] = useState('')
  const [nomInscription, setNomInscription] = useState('')
  const [prenomInscription, setPrenomInscription] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  if (!annonce?.id) {
    return <Navigate to="/recherche" replace />
  }

  const ouvrirModale = () => {
    setErreur('')
    setErreurTelephone('')
    setEtapeModale('telephone')
    setTelephone(state?.telephone || '')
    setModaleOuverte(true)
  }

  const fermerModale = () => {
    setModaleOuverte(false)
    setErreur('')
    setErreurTelephone('')
  }

  const gererChangementTelephone = (valeur) => {
    const nettoye = valeur.replace(/\D/g, '')
    setTelephone(nettoye)
    setErreurTelephone(nettoye ? validerTelephone(nettoye) : '')
  }

  const lancerMiseEnRelation = async () => {
    setErreur('')
    setChargement(true)
    try {
      const { data } = await declencherMiseEnRelation(annonce.id, telephone)
      navigue(`/beneficiaire/${data.id}`, { state: { miseEnRelation: data } })
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'Impossible de lancer la mise en relation. Réessayez.'))
      setModaleOuverte(false)
    } finally {
      setChargement(false)
    }
  }

  const confirmerIdentite = async (e) => {
    e.preventDefault()
    const erreurTel = validerTelephone(telephone)
    if (erreurTel) {
      setErreurTelephone(erreurTel)
      return
    }
    setErreur('')
    setErreurTelephone('')
    setChargement(true)
    try {
      const { data } = await verifierTelephone(telephone)
      if (data.inscrit) {
        await lancerMiseEnRelation()
      } else {
        setEtapeModale('inscription')
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'Impossible de vérifier ce numéro. Réessayez.'))
    } finally {
      setChargement(false)
    }
  }

  const inscrireEtConfirmer = async (e) => {
    e.preventDefault()
    if (!nomInscription.trim() || !prenomInscription.trim()) {
      setErreur('Le nom et le prénom sont obligatoires.')
      return
    }
    setErreur('')
    setChargement(true)
    try {
      await inscrireBeneficiaire({
        telephone,
        nom: nomInscription.trim(),
        prenom: prenomInscription.trim(),
      })
      await lancerMiseEnRelation()
    } catch (err) {
      setErreur(extraireMessageErreur(err, "Erreur lors de l'inscription. Vérifiez les champs."))
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-emerald-50/20 flex flex-col font-sans relative overflow-hidden selection:bg-brand-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.07),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.05),_transparent_50%)] pointer-events-none" />

      <header className="fixed top-0 inset-x-0 z-50">
        <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(2,132,199,0.06)]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-3">
            <button
              onClick={() => navigue(-1)}
              className="group flex items-center gap-3 shrink-0"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-lg group-hover:rotate-[-2deg]">
                <Shield size={20} />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                  CNI<span className="text-brand-600">Finder</span>
                </span>
                <span className="text-[10px] font-bold text-brand-500/80 uppercase tracking-[0.14em]">
                  Détail de l'annonce
                </span>
              </span>
            </button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigue(-1)}
              className="btn-outline !px-4 !py-2 !text-sm inline-flex items-center gap-2"
            >
              <ArrowLeft size={15} />
              Retour
            </motion.button>
          </div>
        </div>
      </header>

      <FondLumineux />

      <main className="flex-grow max-w-2xl w-full mx-auto px-5 sm:px-6 pt-24 sm:pt-28 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <CarteEtape className="text-center">
            <EnteteEtape
              badge="Annonce vérifiée"
              titre="Vérifiez que c'est bien votre carte"
              sousTitre="Comparez la photo ci-dessous avec votre carte nationale d'identité avant de confirmer."
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto mb-6 w-fit"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-400/25 to-emerald-400/10 rounded-full blur-2xl" />
              <div className="relative">
                <PhotoTitulaire
                  url={annonce.photo_titulaire}
                  prenom={annonce.prenom_titulaire}
                  nom={annonce.nom_titulaire}
                />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2"
            >
              {annonce.prenom_titulaire} {annonce.nom_titulaire}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-sm text-slate-400 font-medium mb-8"
            >
              Publiée le {formaterDatePublication(annonce.date_creation)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mb-8 rounded-2xl bg-gradient-to-br from-brand-50/70 to-white border border-brand-100/80 p-5 text-left"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <Lock size={14} />
                </span>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Si cette photo est bien la vôtre, cliquez sur « Oui, c'est moi » pour accéder
                  aux coordonnées de la personne qui a retrouvé votre carte et organiser sa récupération.
                </p>
              </div>
            </motion.div>

            <AnimatePresence>
              {erreur && !modaleOuverte && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                  className="bg-red-50/90 backdrop-blur-sm text-red-700 text-sm rounded-2xl px-4 py-3.5 mb-6 border border-red-100 shadow-soft flex items-start gap-3 text-left"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">
                    <AlertCircle size={12} />
                  </span>
                  <span>{erreur}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={ouvrirModale}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full animate-shine !py-4 text-base flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Oui, c'est moi
            </motion.button>

            <motion.button
              type="button"
              onClick={() => navigue(-1)}
              whileHover={{ x: -3 }}
              className="group w-full text-center text-sm text-slate-500 font-medium hover:text-brand-600 pt-5 transition-colors duration-300"
            >
              <span className="inline-flex items-center gap-2">
                <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
                Retour aux résultats
              </span>
            </motion.button>
          </CarteEtape>
        </motion.div>
      </main>

      <footer className="relative z-10 mt-auto px-5 sm:px-6 pb-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-brand-100/70 bg-white/70 backdrop-blur-xl px-6 py-4 shadow-soft">
          <p className="text-xs text-slate-500">
            © 2026 <span className="font-semibold text-slate-700">CNIFinder</span> · Recherche d'une CNI perdue
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Shield size={13} />
            Recherche confidentielle · Données protégées
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {modaleOuverte && (
          <motion.div
            key="modale-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={fermerModale}
          >
            <motion.div
              key="modale-content"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-brand-400/15 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />

              <div className="p-8 relative z-10">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                    className="mx-auto mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 flex items-center justify-center shadow-inner"
                  >
                    <CheckCircle2 size={28} />
                  </motion.div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Confirmer votre identité</h3>
                </div>

                {etapeModale === 'telephone' ? (
                    <motion.form
                      key="form-tel"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={confirmerIdentite}
                    >
                      <p className="text-slate-500 text-sm leading-relaxed mb-5 text-center">
                        Renseignez votre numéro de téléphone pour accéder aux coordonnées du déclarant.
                      </p>
                      <div className="space-y-1.5 mb-6">
                        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                          <Phone size={14} className="text-brand-500" />
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={telephone}
                          maxLength={9}
                          placeholder="699 000 000"
                          onChange={(e) => gererChangementTelephone(e.target.value)}
                          className="w-full pl-4 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300 text-center text-lg font-semibold tracking-[0.2em] tabular-nums"
                        />
                        {erreurTelephone && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-xs text-red-600 font-medium flex items-center gap-1"
                          >
                            <AlertCircle size={12} />
                            {erreurTelephone}
                          </motion.p>
                        )}
                      </div>
                      {erreur && (
                        <div role="alert" className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 border border-red-100 flex items-start gap-2">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          <span>{erreur}</span>
                        </div>
                      )}
                      <motion.button
                        type="submit"
                        disabled={chargement || !!erreurTelephone}
                        whileHover={{ scale: chargement ? 1 : 1.02 }}
                        whileTap={{ scale: chargement ? 1 : 0.98 }}
                        className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {chargement ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Vérification...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            Oui, c'est moi
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="form-inscription"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={inscrireEtConfirmer}
                    >
                      <p className="text-slate-500 text-sm leading-relaxed mb-5 text-center">
                        Ce numéro n'est pas encore inscrit. Complétez vos informations pour créer votre
                        compte et accéder aux coordonnées du déclarant.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            <User size={14} className="text-brand-500" />
                            Nom
                          </label>
                          <input
                            type="text"
                            value={nomInscription}
                            onChange={(e) => setNomInscription(e.target.value)}
                            placeholder="Ex : Mbarga"
                            className="w-full pl-4 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            <User size={14} className="text-brand-500" />
                            Prénom
                          </label>
                          <input
                            type="text"
                            value={prenomInscription}
                            onChange={(e) => setPrenomInscription(e.target.value)}
                            placeholder="Ex : Jean"
                            className="w-full pl-4 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div className="text-left mb-5 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Phone size={12} className="text-brand-500" />
                          Numéro utilisé : <span className="font-semibold text-slate-700">{telephone}</span>
                        </p>
                      </div>
                      {erreur && (
                        <div role="alert" className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 border border-red-100 flex items-start gap-2">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          <span>{erreur}</span>
                        </div>
                      )}
                      <motion.button
                        type="submit"
                        disabled={chargement}
                        whileHover={{ scale: chargement ? 1 : 1.02 }}
                        whileTap={{ scale: chargement ? 1 : 0.98 }}
                        className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {chargement ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Créer mon compte et continuer
                          </>
                        )}
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => {
                          setEtapeModale('telephone')
                          setErreur('')
                        }}
                        disabled={chargement}
                        className="group w-full text-center text-sm text-slate-500 font-medium hover:text-brand-600 pt-4 transition-all duration-300 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
                        Retour
                      </button>
                    </motion.form>
                  )}

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={fermerModale}
                    disabled={chargement}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DetailAnnonce
