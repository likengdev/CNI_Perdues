import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { rechercherAnnonces } from '../api/annonces'
import { verifierTelephone, inscrireBeneficiaire } from '../api/utilisateurs'
import { extraireMessageErreur } from '../api/client'
import {
  Shield,
  Search,
  Home,
  UserPlus,
  LogIn,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Phone,
  User,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

const REGEX_TELEPHONE_CM = /^6\d{8}$/

function validerTelephone(valeur) {
  if (!REGEX_TELEPHONE_CM.test(valeur)) {
    return 'Le numéro doit contenir 9 chiffres et commencer par 6 (ex : 699000000).'
  }
  return ''
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const fadeChild = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

function ChampFormulaire({ label, icon: Icon, children, erreur }) {
  return (
    <motion.div variants={fadeChild} className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {Icon && <Icon size={14} className="text-brand-500" />}
        {label}
      </label>
      {children}
      <AnimatePresence>
        {erreur && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-600 font-medium flex items-center gap-1 overflow-hidden"
          >
            <AlertCircle size={12} />
            {erreur}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Recherche() {
  const navigue = useNavigate()
  const [searchParams] = useSearchParams()

  const nomInit = searchParams.get('nom') || ''
  const prenomInit = searchParams.get('prenom') || ''

  const [etape, setEtape] = useState(nomInit && prenomInit ? 'recherche' : 'inscription')
  const [mode, setMode] = useState('inscription')
  const [telephone, setTelephone] = useState('')
  const [nomInscription, setNomInscription] = useState('')
  const [prenomInscription, setPrenomInscription] = useState('')
  const [prenom, setPrenom] = useState(prenomInit)
  const [nom, setNom] = useState(nomInit)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [erreurTelephone, setErreurTelephone] = useState('')

  const gererChangementTelephone = (valeur) => {
    const nettoye = valeur.replace(/\D/g, '')
    setTelephone(nettoye)
    setErreurTelephone(nettoye ? validerTelephone(nettoye) : '')
  }

  const soumettreInscription = async (e) => {
    e.preventDefault()
    const erreurTel = validerTelephone(telephone)
    if (erreurTel) {
      setErreurTelephone(erreurTel)
      return
    }
    if (!nomInscription.trim() || !prenomInscription.trim()) {
      setErreur('Le nom et le prénom sont obligatoires.')
      return
    }
    setErreur('')
    setErreurTelephone('')
    setChargement(true)
    try {
      await inscrireBeneficiaire({
        telephone,
        nom: nomInscription.trim(),
        prenom: prenomInscription.trim(),
      })
      setEtape('recherche')
    } catch (err) {
      setErreur(extraireMessageErreur(err, "Erreur lors de l'inscription. Vérifiez les champs."))
    } finally {
      setChargement(false)
    }
  }

  const confirmerNumero = async (e) => {
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
        setEtape('recherche')
      } else {
        setErreur('Ce numéro n\'est pas encore inscrit. Créez votre compte pour continuer.')
        setMode('inscription')
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'Impossible de vérifier ce numéro. Réessayez.'))
    } finally {
      setChargement(false)
    }
  }

  const executerRecherche = async (nomRecherche, prenomRecherche) => {
    setErreur('')
    setChargement(true)
    try {
      const { data } = await rechercherAnnonces(nomRecherche.trim(), prenomRecherche.trim())
      navigue('/recherche/resultats', {
        state: {
          resultats: data,
          nom: nomRecherche.trim(),
          prenom: prenomRecherche.trim(),
          telephone,
        },
      })
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'La recherche a échoué.'))
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    if (!nomInit || !prenomInit) return
    let annule = false
    const executer = async () => {
      try {
        const { data } = await rechercherAnnonces(nomInit.trim(), prenomInit.trim())
        if (annule) return
        navigue('/recherche/resultats', {
          replace: true,
          state: {
            resultats: data,
            nom: nomInit.trim(),
            prenom: prenomInit.trim(),
            telephone,
          },
        })
      } catch (err) {
        if (!annule) setErreur(extraireMessageErreur(err, 'La recherche a échoué. Réessayez.'))
      }
    }
    executer()
    return () => {
      annule = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomInit, prenomInit, navigue])

  const lancerRecherche = (e) => {
    e.preventDefault()
    if (!nom.trim() || !prenom.trim()) {
      setErreur('Renseignez le nom et le prénom pour lancer la recherche.')
      return
    }
    executerRecherche(nom, prenom)
  }

  const etapeIndex = etape === 'inscription' ? 0 : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-emerald-50/20 flex flex-col font-sans relative overflow-hidden selection:bg-brand-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.07),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.05),_transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/5 blur-3xl rounded-full pointer-events-none" />

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
              {['Inscription', 'Recherche'].map((label, index) => {
                const actif = etapeIndex === index
                const passe = etapeIndex > index
                return (
                  <div key={label} className="flex items-center gap-1.5">
                    <motion.span
                      animate={{
                        scale: actif ? 1.1 : 1,
                        backgroundColor: actif ? '#0284c7' : passe ? '#e0f2fe' : '#f1f5f9',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                        actif ? 'text-white shadow-glow' : passe ? 'text-brand-700' : 'text-slate-400'
                      }`}
                    >
                      {passe ? <CheckCircle2 size={13} strokeWidth={3} /> : index + 1}
                    </motion.span>
                    <span
                      className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
                        actif ? 'text-brand-700' : passe ? 'text-brand-500' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                    {index < 1 && <span className="mx-1 h-px w-4 bg-slate-200" />}
                  </div>
                )
              })}
            </nav>

            <div className="flex items-center gap-2.5">
              <span className="hidden md:inline-block text-xs font-bold text-slate-400 tracking-wide">
                Étape <span className="text-brand-600">{etapeIndex + 1}</span>/2
              </span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigue('/')}
                className="btn-outline !px-4 !py-2 !text-sm inline-flex items-center gap-2"
              >
                <Home size={15} />
                Accueil
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-28 pb-12 relative z-10">
        <section className="px-5 sm:px-6 mb-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-brand-700 px-4 py-2 rounded-full text-sm font-semibold border border-brand-100 shadow-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Recherche sécurisée
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-5"
            >
              Retrouvez votre{' '}
              <span className="text-gradient">carte d'identité</span> perdue
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
            >
              Recherchez parmi les annonces vérifiées par notre équipe : saisissez votre nom et
              votre prénom, puis comparez la photo de la carte pour organiser sa récupération.
            </motion.p>
          </div>
        </section>

        <AnimatePresence>
          {erreur && (
            <motion.div
              key="erreur"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto px-5 sm:px-6 mb-6"
            >
              <div
                role="alert"
                className="bg-red-50/90 backdrop-blur-sm text-red-700 text-sm rounded-2xl px-5 py-4 border border-red-100 shadow-sm flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertCircle size={14} />
                </span>
                <span className="leading-relaxed">{erreur}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {etape === 'inscription' ? (
            <motion.section
              key="inscription"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="px-5 sm:px-6"
            >
              <div className="max-w-lg mx-auto">
                <div className="relative bg-white/90 backdrop-blur-xl p-7 sm:p-9 rounded-[2rem] shadow-[0_20px_60px_rgba(2,132,199,0.08),0_2px_8px_rgba(15,23,42,0.04)] border border-white/80 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-400" />
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-400/10 blur-3xl rounded-full pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-400/8 blur-3xl rounded-full pointer-events-none" />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center mb-7"
                  >
                    <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center shadow-inner">
                      {mode === 'inscription' ? (
                        <UserPlus size={26} className="text-brand-600" />
                      ) : (
                        <LogIn size={26} className="text-brand-600" />
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {mode === 'inscription' ? 'Créer votre compte' : 'Connexion rapide'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      {mode === 'inscription'
                        ? 'Inscription sécurisée pour accéder à la recherche'
                        : 'Entrez votre numéro pour accéder directement à la recherche'}
                    </p>
                  </motion.div>

                  <AnimatePresence>
                    {mode === 'inscription' ? (
                      <motion.form
                        key="form-inscription"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={soumettreInscription}
                        className="space-y-4"
                      >
                        <ChampFormulaire label="Nom" icon={User}>
                          <div className="relative group">
                            <input
                              type="text"
                              value={nomInscription}
                              onChange={(e) => setNomInscription(e.target.value)}
                              placeholder="ex : Bernard"
                              className="w-full pl-4 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300 group-hover:border-slate-300"
                            />
                          </div>
                        </ChampFormulaire>

                        <ChampFormulaire label="Prénom" icon={User}>
                          <input
                            type="text"
                            value={prenomInscription}
                            onChange={(e) => setPrenomInscription(e.target.value)}
                            placeholder="ex : Naomi"
                            className="w-full pl-4 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300 hover:border-slate-300"
                          />
                        </ChampFormulaire>

                        <ChampFormulaire label="Téléphone" icon={Phone} erreur={erreurTelephone}>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={telephone}
                            maxLength={9}
                            placeholder="699 000 000"
                            onChange={(e) => gererChangementTelephone(e.target.value)}
                            className="w-full pl-4 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300 hover:border-slate-300 text-center text-lg font-semibold tracking-[0.2em] tabular-nums"
                          />
                        </ChampFormulaire>

                        <motion.button
                          type="submit"
                          disabled={chargement}
                          whileHover={{ scale: chargement ? 1 : 1.02 }}
                          whileTap={{ scale: chargement ? 1 : 0.98 }}
                          className="btn-primary w-full !py-4 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {chargement ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Création...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} />
                              Créer votre compte et continuer
                            </>
                          )}
                        </motion.button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="form-confirmation"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={confirmerNumero}
                        className="space-y-4"
                      >
                        <ChampFormulaire label="Téléphone" icon={Phone} erreur={erreurTelephone}>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={telephone}
                            maxLength={9}
                            placeholder="699 000 000"
                            onChange={(e) => gererChangementTelephone(e.target.value)}
                            className="w-full pl-4 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300 hover:border-slate-300 text-center text-lg font-semibold tracking-[0.2em] tabular-nums"
                          />
                        </ChampFormulaire>

                        <motion.button
                          type="submit"
                          disabled={chargement}
                          whileHover={{ scale: chargement ? 1 : 1.02 }}
                          whileTap={{ scale: chargement ? 1 : 0.98 }}
                          className="btn-primary w-full !py-4 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {chargement ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Vérification...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              Confirmer mon numéro
                            </>
                          )}
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="mt-6 text-center">
                    <AnimatePresence>
                      {mode === 'inscription' ? (
                        <motion.button
                          key="lien-connexion"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          type="button"
                          onClick={() => { setMode('confirmation'); setErreur(''); setErreurTelephone(''); setTelephone('') }}
                          disabled={chargement}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          <LogIn size={14} />
                          Déjà inscrit ? Confirmer votre numéro
                        </motion.button>
                      ) : (
                        <motion.button
                          key="lien-inscription"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          type="button"
                          onClick={() => { setMode('inscription'); setErreur(''); setErreurTelephone(''); setTelephone('') }}
                          disabled={chargement}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          <ChevronLeft size={14} />
                          Créer un nouveau compte
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="recherche"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="px-5 sm:px-6"
            >
              <div className="max-w-4xl mx-auto">
                <div className="relative bg-white/90 backdrop-blur-xl p-7 md:p-9 rounded-[2rem] shadow-[0_20px_60px_rgba(2,132,199,0.08),0_2px_8px_rgba(15,23,42,0.04)] border border-white/80 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-400" />
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-400/10 blur-3xl rounded-full pointer-events-none" />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center mb-7"
                  >
                    <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center shadow-inner">
                      <Search size={26} className="text-brand-600" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Lancez votre recherche
                    </h2>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Saisissez le nom et le prénom tels qu'ils figurent sur votre CNI
                    </p>
                  </motion.div>

                  <form onSubmit={lancerRecherche}>
                    <motion.div
                      variants={stagger}
                      initial="initial"
                      animate="animate"
                      className="grid md:grid-cols-3 gap-4 items-end"
                    >
                      <ChampFormulaire label="Prénom" icon={User}>
                        <div className="relative">
                          <input
                            type="text"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            placeholder="ex : Naomi"
                            className="w-full pl-4 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300 hover:border-slate-300"
                          />
                        </div>
                      </ChampFormulaire>

                      <ChampFormulaire label="Nom" icon={User}>
                        <input
                          type="text"
                          value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          placeholder="ex : Bernard"
                          className="w-full pl-4 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 focus:bg-white transition-all duration-300 hover:border-slate-300"
                        />
                      </ChampFormulaire>

                      <motion.div variants={fadeChild}>
                        <motion.button
                          type="submit"
                          disabled={chargement}
                          whileHover={{ scale: chargement ? 1 : 1.03 }}
                          whileTap={{ scale: chargement ? 1 : 0.97 }}
                          className="btn-primary w-full h-[52px] !py-0 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {chargement ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Recherche...
                            </>
                          ) : (
                            <>
                              <Search size={18} />
                              Lancer la recherche
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.section>
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

export default Recherche
