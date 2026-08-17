import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FondLumineux } from '../components/annonces/ComposantsParcours'
import { confirmerRestitution } from '../api/miseEnRelation'
import { extraireMessageErreur } from '../api/client'
import {
  Shield,
  CheckCircle2,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  CreditCard,
  Phone,
  Clock,
  PartyPopper,
  ImageOff,
} from 'lucide-react'

function formaterDate(valeur) {
  if (!valeur) return '—'
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return String(valeur)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function PhotoTitulaire({ url, prenom, nom }) {
  const [manquante, setManquante] = useState(!url)

  if (!url || manquante) {
    return (
      <div className="h-48 w-36 shrink-0 rounded-2xl border-2 border-dashed border-brand-200/60 bg-gradient-to-br from-brand-50/50 to-slate-50 flex flex-col items-center justify-center gap-2 text-brand-300">
        <ImageOff size={26} strokeWidth={1.5} />
        <span className="text-[10px] font-medium px-2 text-center">Photo indisponible</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={`Photo de ${prenom} ${nom}`}
      onError={() => setManquante(true)}
      className="h-48 w-36 shrink-0 object-cover rounded-2xl border-2 border-white shadow-glow-lg bg-slate-100"
    />
  )
}

function LigneInfo({ icone, libelle, valeur }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icone}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{libelle}</p>
        <p className="font-semibold text-slate-800 truncate">{valeur || '—'}</p>
      </div>
    </div>
  )
}

function PageBeneficiaire() {
  const { state } = useLocation()

  const m = state?.miseEnRelation

  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [confirme, setConfirme] = useState(Boolean(m?.confirmation_beneficiaire))

  if (!m?.id) {
    return <Navigate to="/recherche" replace />
  }

  const soumettreConfirmation = async () => {
    setErreur('')
    setChargement(true)
    try {
      const { data } = await confirmerRestitution(m.id)
      setConfirme(data.confirmation_beneficiaire !== false)
    } catch (err) {
      setErreur(extraireMessageErreur(err, "Impossible d'enregistrer la confirmation. Réessayez."))
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-emerald-50/20 flex flex-col font-sans relative overflow-hidden selection:bg-brand-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.07),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.05),_transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/5 blur-3xl rounded-full pointer-events-none" />

      <header className="fixed top-0 inset-x-0 z-50">
        <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(2,132,199,0.06)]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                <Shield size={20} />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                  CNI<span className="text-brand-600">Finder</span>
                </span>
                <span className="text-[10px] font-bold text-brand-500/80 uppercase tracking-[0.14em]">
                  Espace bénéficiaire
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <FondLumineux />

      <main className="flex-grow max-w-3xl w-full mx-auto px-5 sm:px-6 pt-24 sm:pt-28 pb-12 relative z-10">
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
            <span className="text-xs font-bold text-brand-700 tracking-widest uppercase">Espace bénéficiaire</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Bonjour {m.beneficiaire_prenom || m.beneficiaire_nom || ''}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Votre carte a été retrouvée. Vérifiez les informations ci-dessous, puis contactez
            le déclarant pour organiser la remise.
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

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(2,132,199,0.08),0_2px_8px_rgba(15,23,42,0.04)] border border-white/80 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-brand-400" />
              <div className="flex items-center gap-2.5 mb-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                  <CreditCard size={17} />
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-900">Vérifiez que c'est bien votre carte</h2>
                  <p className="text-xs text-slate-400 font-medium">Toutes les informations de l'annonce</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <PhotoTitulaire
                  url={m.annonce_photo_titulaire}
                  prenom={m.annonce_prenom_titulaire}
                  nom={m.annonce_nom_titulaire}
                />
                <div className="grid grid-cols-1 gap-4 flex-1 w-full">
                  <LigneInfo
                    libelle="Titulaire"
                    valeur={`${m.annonce_prenom_titulaire} ${m.annonce_nom_titulaire}`}
                    icone={<User size={16} />}
                  />
                  <LigneInfo
                    libelle="Date de naissance"
                    valeur={formaterDate(m.annonce_date_naissance)}
                    icone={<Calendar size={16} />}
                  />
                  <LigneInfo
                    libelle="Lieu de naissance"
                    valeur={m.annonce_lieu_naissance}
                    icone={<MapPin size={16} />}
                  />
                  <LigneInfo
                    libelle="N° de la CNI"
                    valeur={m.annonce_numero_carte}
                    icone={<CreditCard size={16} />}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(2,132,199,0.08),0_2px_8px_rgba(15,23,42,0.04)] border border-white/80 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <div className="flex items-center gap-2.5 mb-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Phone size={17} />
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-900">Le déclarant à contacter</h2>
                  <p className="text-xs text-slate-400 font-medium">Organisez la remise de la carte avec cette personne</p>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-100/80 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Déclarant</p>
                    <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {m.declarant_prenom} {m.declarant_nom}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/80 border border-emerald-200/60 px-5 py-3.5 shadow-soft">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Phone size={18} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Téléphone</p>
                      <p className="text-lg font-extrabold text-slate-900 tracking-tight">{m.declarant_telephone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {confirme ? (
              <motion.div
                key="confirme"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white/90 backdrop-blur-xl p-8 sm:p-10 text-center rounded-[2rem] shadow-[0_20px_60px_rgba(16,185,129,0.1)] border border-emerald-100/60 relative overflow-hidden"
              >
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.15 }}
                  className="mx-auto mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shadow-inner"
                >
                  <PartyPopper size={30} className="text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Restitution confirmée</h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Merci {m.beneficiaire_prenom} ! Votre confirmation a bien été enregistrée.
                  L'administration va clôturer votre dossier.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="non-confirme"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur-xl p-8 sm:p-10 text-center rounded-[2rem] shadow-[0_20px_60px_rgba(2,132,199,0.08),0_2px_8px_rgba(15,23,42,0.04)] border border-white/80 relative overflow-hidden"
              >
                  <div className="absolute -top-16 -left-16 w-40 h-40 bg-brand-400/10 blur-3xl rounded-full pointer-events-none" />
                  <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center shadow-inner">
                    <Phone size={28} className="text-brand-600" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Comment ça se passe ?</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
                    Contactez le déclarant au{' '}
                    <span className="font-bold text-slate-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {m.declarant_telephone}
                    </span>{' '}
                    pour convenir d'un lieu et d'un horaire de remise. Une fois votre carte récupérée,
                    confirmez-le ici pour clôturer votre demande.
                  </p>
                  <motion.button
                    type="button"
                    onClick={soumettreConfirmation}
                    disabled={chargement}
                    whileHover={{ scale: chargement ? 1 : 1.02, y: -2 }}
                    whileTap={{ scale: chargement ? 1 : 0.98 }}
                    className="btn-primary w-full sm:w-auto animate-shine disabled:opacity-50 inline-flex items-center justify-center gap-2 !py-4"
                  >
                    {chargement ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Confirmation...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Je confirme avoir récupéré ma CNI
                      </>
                    )}
                  </motion.button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex items-center justify-center gap-2 px-6 py-4"
          >
            <Clock size={14} className="text-slate-300" />
            <p className="text-xs text-slate-400">
              Cette mise en relation expire automatiquement le {formaterDate(m.date_expiration)}.
            </p>
          </motion.div>
        </div>
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

export default PageBeneficiaire
