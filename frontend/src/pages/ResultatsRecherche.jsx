import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { rechercherAnnonces } from '../api/annonces'
import { extraireMessageErreur } from '../api/client'
import {
  Shield,
  Search,
  ChevronRight,
  Filter,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
  FileSearch,
  RotateCcw,
  ImageOff,
} from 'lucide-react'

function formaterDatePublication(valeur) {
  if (!valeur) return '—'
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return String(valeur)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function PhotoCni({ url, prenom, nom }) {
  const [manquante, setManquante] = useState(!url)

  if (!url || manquante) {
    return (
      <div className="h-48 w-36 rounded-2xl border-2 border-dashed border-brand-200/60 bg-gradient-to-br from-brand-50/50 to-slate-50 flex flex-col items-center justify-center gap-2 text-brand-300">
        <ImageOff size={28} strokeWidth={1.5} />
        <span className="text-[10px] font-medium px-2 text-center">Photo indisponible</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={`Photo de ${prenom} ${nom}`}
      loading="lazy"
      onError={() => setManquante(true)}
      className="h-48 w-36 rounded-2xl object-cover border-2 border-white shadow-glow-lg bg-slate-100 transition-transform duration-500 group-hover:scale-[1.03]"
    />
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function ResultatsRecherche() {
  const { state } = useLocation()
  const navigue = useNavigate()

  const resultatsInitiaux = state?.resultats
  const nom = state?.nom || ''
  const prenom = state?.prenom || ''
  const telephone = state?.telephone || ''

  const [resultats, setResultats] = useState(resultatsInitiaux || [])
  const [dateNaissance, setDateNaissance] = useState('')
  const [numeroCarte, setNumeroCarte] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  if (!state?.resultats || !nom || !prenom) {
    return <Navigate to="/recherche" replace />
  }

  const afficherAffinage = resultats.length > 1

  const affinerRecherche = async (e) => {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const { data } = await rechercherAnnonces(nom, prenom, dateNaissance || undefined, numeroCarte || undefined)
      setResultats(data)
    } catch (err) {
      setErreur(extraireMessageErreur(err, "Impossible d'affiner la recherche."))
    } finally {
      setChargement(false)
    }
  }

  const voirDetail = (annonce) => {
    navigue(`/annonce/${annonce.id}`, {
      state: { annonce, telephone },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-emerald-50/20 flex flex-col font-sans relative overflow-hidden selection:bg-brand-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.07),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.05),_transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/5 blur-3xl rounded-full pointer-events-none" />

      <header className="fixed top-0 inset-x-0 z-50">
        <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(2,132,199,0.06)]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-3">
            <button
              onClick={() => navigue('/')}
              className="group flex items-center gap-3 shrink-0"
              title="Retour à l'accueil"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-lg group-hover:rotate-[-2deg]">
                <Shield size={20} />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                  CNI<span className="text-brand-600">Finder</span>
                </span>
                <span className="text-[10px] font-bold text-brand-500/80 uppercase tracking-[0.14em]">
                  Recherche CNI
                </span>
              </span>
            </button>

            <nav aria-label="Progression" className="hidden md:flex items-center gap-1">
              {['Inscription', 'Recherche', 'Résultats'].map((label, index) => {
                const actif = index === 2
                const passe = index < 2
                return (
                  <div key={label} className="flex items-center gap-1.5">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${
                        actif
                          ? 'bg-brand-600 text-white shadow-glow scale-110'
                          : passe
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {passe ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        actif ? 'text-brand-700' : passe ? 'text-brand-500' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                    {index < 2 && <span className="mx-1 h-px w-4 bg-slate-200" />}
                  </div>
                )
              })}
            </nav>

            <div className="flex items-center gap-2.5">
              <span className="hidden md:inline-block text-xs font-bold text-slate-400 tracking-wide">
                Étape <span className="text-brand-600">3</span>/3
              </span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigue('/recherche')}
                className="btn-outline !px-4 !py-2 !text-sm inline-flex items-center gap-2"
              >
                <RotateCcw size={15} />
                Nouvelle recherche
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-5 sm:px-6 pt-24 sm:pt-28 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-brand-100 px-4 py-1.5 shadow-sm mb-5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            <span className="text-xs font-bold text-brand-700 tracking-widest uppercase">Résultats de recherche</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {resultats.length > 0 ? (
              <>
                {resultats.length} annonce{resultats.length > 1 ? 's' : ''} trouvée{resultats.length > 1 ? 's' : ''}
              </>
            ) : (
              'Aucun résultat'
            )}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Recherche pour « <span className="font-semibold text-slate-700">{prenom} {nom}</span> ».
          </p>
        </motion.div>

        <AnimatePresence>
          {erreur && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              role="alert"
              className="bg-red-50/90 backdrop-blur-sm text-red-700 text-sm rounded-2xl px-5 py-4 mb-6 border border-red-100 shadow-soft flex items-start gap-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={14} />
              </span>
              <span className="leading-relaxed">{erreur}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {afficherAffinage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mb-10"
            >
              <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(2,132,199,0.08),0_2px_8px_rgba(15,23,42,0.04)] border border-white/80 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-brand-400 to-brand-600" />
                <form onSubmit={affinerRecherche}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <Filter size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {resultats.length > 1
                            ? `Plusieurs homonymes détectés (${resultats.length})`
                            : 'Affiner la recherche'}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {resultats.length > 1
                            ? 'Précisez votre numéro de CNI ou votre date de naissance pour retrouver votre carte.'
                            : 'Vous pouvez préciser votre numéro de CNI ou votre date de naissance.'}
                        </p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                          <CreditCard size={14} className="text-brand-500" />
                          Numéro de CNI
                          <span className="text-xs font-normal text-slate-400">(optionnel)</span>
                        </label>
                        <input
                          type="text"
                          value={numeroCarte}
                          onChange={(e) => setNumeroCarte(e.target.value)}
                          placeholder="ex : 1129800054832"
                          className="w-full pl-4 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300 hover:border-slate-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                          <Calendar size={14} className="text-brand-500" />
                          Date de naissance
                          <span className="text-xs font-normal text-slate-400">(optionnel)</span>
                        </label>
                        <input
                          type="date"
                          value={dateNaissance}
                          onChange={(e) => setDateNaissance(e.target.value)}
                          className="w-full pl-4 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300 hover:border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={chargement}
                        whileHover={{ scale: chargement ? 1 : 1.03 }}
                        whileTap={{ scale: chargement ? 1 : 0.97 }}
                        className="btn-outline !px-6 !py-3 flex items-center gap-2 disabled:opacity-50"
                      >
                        {chargement ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Recherche...
                          </>
                        ) : (
                          <>
                            <Search size={16} />
                            Affiner
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {chargement ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-brand-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-slate-500 font-medium animate-pulse">Recherche en cours...</p>
          </motion.div>
        ) : resultats.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resultats.map((annonce) => (
              <motion.div
                key={annonce.id}
                variants={cardVariants}
                className="h-full"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-soft hover:shadow-[0_24px_60px_rgba(2,132,199,0.14)] transition-shadow duration-500 overflow-hidden flex flex-col p-6 h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50/40 via-transparent to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative mx-auto mb-5">
                    <div className="absolute -inset-3 bg-gradient-to-br from-brand-400/20 to-emerald-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                      <PhotoCni url={annonce.photo_titulaire} prenom={annonce.prenom_titulaire} nom={annonce.nom_titulaire} />
                    </div>
                  </div>

                  <h3 className="relative text-center text-lg font-extrabold text-slate-900 tracking-tight">
                    {annonce.prenom_titulaire} {annonce.nom_titulaire}
                  </h3>
                  <p className="relative text-center text-xs text-slate-400 font-medium mt-1 mb-6">
                    Publiée le {formaterDatePublication(annonce.date_creation)}
                  </p>

                  <motion.button
                    type="button"
                    onClick={() => voirDetail(annonce)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative mt-auto w-full inline-flex items-center justify-center gap-2 btn-primary !py-3 !px-5 !text-sm"
                  >
                    Voir détails
                    <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/90 backdrop-blur-xl p-10 sm:p-14 text-center rounded-[2rem] shadow-[0_20px_60px_rgba(2,132,199,0.08)] border border-white/80"
          >
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-inner">
              <FileSearch size={34} className="text-slate-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Aucun résultat trouvé</h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
              Aucune annonce ne correspond à « {prenom} {nom} » pour le moment.
              Vérifiez l'orthographe du nom et du prénom, puis réessayez. De nouvelles
              annonces vérifiées sont ajoutées régulièrement par notre équipe.
            </p>
            <motion.button
              type="button"
              onClick={() => navigue('/recherche')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Nouvelle recherche
            </motion.button>
          </motion.div>
        )}
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
    </div>
  )
}

export default ResultatsRecherche
