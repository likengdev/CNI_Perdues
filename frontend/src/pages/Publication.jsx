import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { completerProfil, verifierTelephone, inscrireDeclarant } from '../api/utilisateurs'
import { extraireInformationsCni, publierAnnonce } from '../api/annonces'
import { extraireMessageErreur } from '../api/client'

const REGEX_TELEPHONE_CM = /^6\d{8}$/
const REGEX_DATE_ISO = /^\d{4}-\d{2}-\d{2}$/
const REGEX_DATE_CNI = /^\d{2}\.\d{2}\.\d{4}$/

const ETAPES_PROGRESSION = [
  { id: 'compte', label: 'Compte' },
  { id: 'photos', label: 'Photos' },
  { id: 'infos', label: 'Infos' },
  { id: 'lieu', label: 'Lieu' },
  { id: 'resume', label: 'Résumé' },
]

const LIBELLES_POSITION = {
  possession: 'En ma possession',
  commissariat: 'Commissariat',
  mairie: 'Mairie',
  autre: 'Autre lieu',
}

function validerTelephone(valeur) {
  if (!REGEX_TELEPHONE_CM.test(valeur)) {
    return 'Le numéro doit contenir 9 chiffres et commencer par 6 (ex : 699000000).'
  }
  return ''
}

function normaliserDateNaissance(valeur) {
  const texte = (valeur || '').trim()
  if (!texte) return ''
  if (REGEX_DATE_ISO.test(texte)) return texte
  if (REGEX_DATE_CNI.test(texte)) {
    const [jj, mm, aaaa] = texte.split('.')
    return `${aaaa}-${mm}-${jj}`
  }
  return texte
}

function fichierVersBase64(fichier) {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader()
    lecteur.onload = () => {
      const resultat = String(lecteur.result || '')
      const base64 = resultat.includes(',') ? resultat.split(',')[1] : resultat
      resolve(base64)
    }
    lecteur.onerror = () => reject(new Error('Lecture du fichier impossible.'))
    lecteur.readAsDataURL(fichier)
  })
}

function IndicateurProgression({ etape }) {
  const indexActif = useMemo(() => {
    if (etape === 'inscription' || etape === 'confirmation-telephone' || etape === 'completer-profil') return 0
    if (etape === 'recto' || etape === 'verso' || etape === 'extraction') return 1
    if (etape === 'formulaire') return 2
    if (etape === 'position') return 3
    if (etape === 'resume') return 4
    return 0
  }, [etape])

  return (
    <nav aria-label="Progression" className="mb-10">
      <ol className="flex items-center gap-0 sm:gap-1">
        {ETAPES_PROGRESSION.map((item, index) => {
          const actif = index === indexActif
          const passe = index < indexActif
          return (
            <li key={item.id} className="flex-1 min-w-0 flex items-center">
              <div className="flex flex-col items-center gap-2.5 w-full relative">
                <div
                  className={`relative z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-500 ${
                    actif
                      ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow scale-110'
                      : passe
                        ? 'bg-brand-600 text-white shadow-soft'
                        : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {passe ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                  {actif && (
                    <span className="absolute inset-0 rounded-full border-2 border-brand-400/50 animate-pulse-ring" />
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold tracking-wide uppercase truncate transition-colors duration-300 ${
                    actif ? 'text-brand-700' : passe ? 'text-brand-500' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {index < ETAPES_PROGRESSION.length - 1 && (
                <div
                  className={`hidden sm:block h-0.5 flex-shrink-0 w-4 md:w-8 -mt-6 mx-1 rounded-full transition-all duration-500 ${
                    passe ? 'bg-gradient-to-r from-brand-600 to-brand-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function BoutonRetour({ onClick, label = 'Retour' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-center text-sm text-slate-500 font-medium hover:text-brand-600 pt-5 transition-all duration-300"
    >
      <span className="inline-flex items-center gap-2">
        <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
        {label}
      </span>
    </button>
  )
}

function EnteteEtape({ badge, titre, sousTitre }) {
  return (
    <div className="mb-8">
      {badge && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 shadow-sm mb-4">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-xs font-semibold text-brand-700 tracking-wide uppercase">{badge}</span>
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        {titre}
      </h1>
      {sousTitre && <p className="text-slate-500 leading-relaxed">{sousTitre}</p>}
    </div>
  )
}

function ChampTexte({ label, value, onChange, type = 'text', placeholder, required, erreur, maxLength }) {
  return (
    <div className="group/field">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider group-focus-within/field:text-brand-600 transition-colors">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={onChange}
        className={`pub-field ${
          erreur
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100/80'
            : 'border-slate-200/80 focus:border-brand-500 focus:ring-brand-100/70 focus:bg-white focus:shadow-[0_0_0_1px_rgba(14,165,233,0.2),0_8px_24px_rgba(14,165,233,0.08)]'
        }`}
      />
      {erreur && <p className="text-red-600 text-xs mt-1.5 animate-fade-in">{erreur}</p>}
    </div>
  )
}

function CarteEtape({ children, className = '' }) {
  return (
    <div className={`pub-card p-8 sm:p-10 animate-scale-in ${className}`}>
      <div className="absolute -top-24 -right-24 w-56 h-56 bg-brand-400/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-16 w-48 h-48 bg-success/10 blur-3xl rounded-full pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function FondLumineux() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.07),_transparent_50%)] pointer-events-none" />
      <div className="absolute top-[-5%] left-[5%] w-[560px] h-[560px] bg-brand-400/25 blur-[130px] rounded-full pointer-events-none animate-glow-drift mix-blend-multiply" />
      <div className="absolute bottom-[5%] right-[0%] w-[480px] h-[480px] bg-success/20 blur-[120px] rounded-full pointer-events-none animate-glow-drift mix-blend-multiply" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[40%] w-[320px] h-[320px] bg-brand-200/30 blur-[100px] rounded-full pointer-events-none animate-float" />
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #0c4a6e 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
    </>
  )
}

function Publication() {
  const navigue = useNavigate()
  const [etape, setEtape] = useState('inscription')
  const [erreur, setErreur] = useState('')
  const [erreurTelephone, setErreurTelephone] = useState('')
  const [chargement, setChargement] = useState(false)

  const [telephone, setTelephone] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [ville, setVille] = useState('')
  const [quartier, setQuartier] = useState('')

  const [fichierRecto, setFichierRecto] = useState(null)
  const [fichierVerso, setFichierVerso] = useState(null)
  const [apercuRecto, setApercuRecto] = useState(null)
  const [apercuVerso, setApercuVerso] = useState(null)

  const [champs, setChamps] = useState({
    nom_titulaire: '',
    prenom_titulaire: '',
    date_naissance: '',
    lieu_naissance: '',
    numero_carte: '',
    photo_titulaire_base64: '',
  })
  const [erreursFormulaire, setErreursFormulaire] = useState({})

  const [positionCni, setPositionCni] = useState('possession')
  const [positionPrecision, setPositionPrecision] = useState('')
  const [erreurPosition, setErreurPosition] = useState('')

  useEffect(() => {
    return () => {
      if (apercuRecto) URL.revokeObjectURL(apercuRecto)
      if (apercuVerso) URL.revokeObjectURL(apercuVerso)
    }
  }, [apercuRecto, apercuVerso])

  const gererChangementTelephone = (valeur) => {
    setTelephone(valeur)
    setErreurTelephone(valeur ? validerTelephone(valeur) : '')
  }

  const aller = (prochaineEtape) => {
    setErreur('')
    setErreurTelephone('')
    setErreurPosition('')
    setEtape(prochaineEtape)
  }

  const soumettreInscription = async (e) => {
    e.preventDefault()
    const erreurTel = validerTelephone(telephone)
    if (erreurTel) {
      setErreurTelephone(erreurTel)
      return
    }

    setErreur('')
    setChargement(true)
    try {
      await inscrireDeclarant({ telephone, nom, prenom, ville, quartier })
      aller('recto')
    } catch (err) {
      const messageTelephone = err.response?.data?.telephone?.[0]
      if (messageTelephone) {
        setErreur(`${messageTelephone} Utilisez ce lien « Déjà  inscrit ? » ci-dessous.`)
      } else {
        setErreur(extraireMessageErreur(err, "Erreur lors de l'inscription. Vérifiez les champs."))
      }
    } finally {
      setChargement(false)
    }
  }

  const soumettreConfirmationTelephone = async (e) => {
    e.preventDefault()
    const erreurTel = validerTelephone(telephone)
    if (erreurTel) {
      setErreurTelephone(erreurTel)
      return
    }

    setErreur('')
    setChargement(true)
    try {
      const { data } = await verifierTelephone(telephone)
      if (!data.inscrit) {
        setErreur("Ce numéro n'est pas encore inscrit. Utilisez le formulaire d'inscription.")
        return
      }

      const utilisateur = data.utilisateur || {}
      setNom(utilisateur.nom || '')
      setPrenom(utilisateur.prenom || '')
      setVille(utilisateur.ville || '')
      setQuartier(utilisateur.quartier || '')

      if (!utilisateur.ville || !utilisateur.quartier) {
        aller('completer-profil')
      } else {
        aller('recto')
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'Impossible de vérifier ce numéro. Vérifiez votre connexion et réessayez.'))
    } finally {
      setChargement(false)
    }
  }

  const soumettreCompleterProfil = async (e) => {
    e.preventDefault()
    if (!ville.trim() || !quartier.trim()) {
      setErreur('La ville et le quartier sont obligatoires pour publier.')
      return
    }

    setErreur('')
    setChargement(true)
    try {
      await completerProfil(telephone, { ville: ville.trim(), quartier: quartier.trim() })
      aller('recto')
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'Impossible de compléter le profil. réessayez.'))
    } finally {
      setChargement(false)
    }
  }

  const gererFichier = (fichier, definirFichier, definirApercu, apercuPrecedent) => {
    if (apercuPrecedent) URL.revokeObjectURL(apercuPrecedent)
    definirFichier(fichier)
    definirApercu(URL.createObjectURL(fichier))
  }

  const lancerExtraction = async () => {
    setErreur('')
    setChargement(true)
    setEtape('extraction')
    try {
      const { data } = await extraireInformationsCni(fichierRecto, fichierVerso)
      setChamps({
        nom_titulaire: data.nom_titulaire || '',
        prenom_titulaire: data.prenom_titulaire || '',
        date_naissance: normaliserDateNaissance(data.date_naissance || ''),
        lieu_naissance: data.lieu_naissance || '',
        numero_carte: data.numero_carte || '',
        photo_titulaire_base64: data.photo_titulaire_base64 || '',
      })
      setErreursFormulaire({})
      aller('formulaire')
    } catch (err) {
      setErreur(extraireMessageErreur(err, "L'extraction a échoué. Vous pouvez remplir les champs manuellement."))
      setEtape('formulaire')
    } finally {
      setChargement(false)
    }
  }

  const modifierChamp = (nomChamp, valeur) => {
    setChamps((precedent) => ({ ...precedent, [nomChamp]: valeur }))
    setErreursFormulaire((precedent) => {
      if (!precedent[nomChamp]) return precedent
      const suivant = { ...precedent }
      delete suivant[nomChamp]
      return suivant
    })
  }

  const ajouterPhotoTitulaire = async (fichier) => {
    if (!fichier) return
    try {
      const base64 = await fichierVersBase64(fichier)
      modifierChamp('photo_titulaire_base64', base64)
      setErreur('')
    } catch {
      setErreur("Impossible de lire la photo du titulaire.")
    }
  }

  const validerFormulaireInfos = () => {
    const erreurs = {}
    const date = normaliserDateNaissance(champs.date_naissance)

    if (!champs.nom_titulaire.trim()) erreurs.nom_titulaire = 'Le nom est obligatoire.'
    if (!champs.prenom_titulaire.trim()) erreurs.prenom_titulaire = 'Le prénom est obligatoire.'
    if (!date || !REGEX_DATE_ISO.test(date)) {
      erreurs.date_naissance = 'Date invalide. Format attendu : AAAA-MM-JJ.'
    }
    if (!champs.lieu_naissance.trim()) erreurs.lieu_naissance = 'Le lieu de naissance est obligatoire.'
    if (!champs.numero_carte.trim()) erreurs.numero_carte = 'Le numéro de carte est obligatoire.'
    if (!champs.photo_titulaire_base64) {
      erreurs.photo_titulaire_base64 = 'Ajoutez la photo du titulaire pour continuer.'
    }

    if (date && REGEX_DATE_ISO.test(date) && date !== champs.date_naissance) {
      setChamps((precedent) => ({ ...precedent, date_naissance: date }))
    }

    setErreursFormulaire(erreurs)
    return Object.keys(erreurs).length === 0
  }

  const continuerDepuisFormulaire = () => {
    setErreur('')
    if (!validerFormulaireInfos()) {
      setErreur('Corrigez les champs indiqués avant de continuer.')
      return
    }
    aller('position')
  }

  const continuerDepuisPosition = () => {
    setErreurPosition('')
    setErreur('')
    if (positionCni === 'autre' && !positionPrecision.trim()) {
      setErreurPosition('Précisez le lieu lorsque vous choisissez  un « Autre lieu ».')
      return
    }
    aller('resume')
  }

  const publier = async () => {
    setErreur('')
    if (!validerFormulaireInfos()) {
      setErreur("Informations incomplètes. Revenez a l'etape précédente.")
      aller('formulaire')
      return
    }
    if (positionCni === 'autre' && !positionPrecision.trim()) {
      setErreur('Précisez le lieu de la carte.')
      aller('position')
      return
    }

    setChargement(true)
    try {
      await publierAnnonce({
        telephone_declarant: telephone,
        photo_recto: fichierRecto,
        photo_verso: fichierVerso,
        nom_titulaire: champs.nom_titulaire.trim(),
        prenom_titulaire: champs.prenom_titulaire.trim(),
        date_naissance: normaliserDateNaissance(champs.date_naissance),
        lieu_naissance: champs.lieu_naissance.trim(),
        numero_carte: champs.numero_carte.trim(),
        photo_titulaire_base64: champs.photo_titulaire_base64,
        position_cni: positionCni,
        position_precision: positionCni === 'autre' ? positionPrecision.trim() : '',
      })
      navigue('/publication/confirmation')
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'La publication a échoué. Vérifiez les champs et rréessayez.'))
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f9ff] flex flex-col font-sans relative overflow-hidden selection:bg-brand-500 selection:text-white">
      <Header />
      <FondLumineux />

      <main className="flex-grow max-w-3xl w-full mx-auto px-5 sm:px-6 pt-28 sm:pt-32 pb-20 relative z-10">
        <div className="text-center mb-8 animate-fade-up">
          <p className="text-sm font-semibold text-brand-600 tracking-wide uppercase mb-2">Publication sécurisée</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Déclarez une <span className="text-gradient">CNI trouvée</span>
          </h2>
        </div>

        <IndicateurProgression etape={etape} />

        {erreur && (
          <div
            role="alert"
            className="bg-red-50/90 backdrop-blur-sm text-red-700 text-sm rounded-2xl px-4 py-3.5 mb-6 border border-red-100 shadow-soft animate-fade-in flex items-start gap-3"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">!</span>
            <span>{erreur}</span>
          </div>
        )}

        {etape === 'inscription' && (
          <form onSubmit={soumettreInscription}>
            <CarteEtape key="inscription" className="space-y-5">
              <EnteteEtape
                badge="Accès  au  compte"
                titre="Créer votre compte"
                sousTitre="Renseignez vos informations pour commencer la publication."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ChampTexte label="Nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
                <ChampTexte label="Prénom" required value={prenom} onChange={(e) => setPrenom(e.target.value)} />
              </div>
              <ChampTexte
                label="Téléphone"
                type="tel"
                required
                value={telephone}
                maxLength={9}
                placeholder="ex : 699000000"
                erreur={erreurTelephone}
                onChange={(e) => gererChangementTelephone(e.target.value.replace(/\D/g, ''))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ChampTexte label="Ville" required value={ville} onChange={(e) => setVille(e.target.value)} />
                <ChampTexte label="Quartier" required value={quartier} onChange={(e) => setQuartier(e.target.value)} />
              </div>

              <button type="submit" disabled={chargement || !!erreurTelephone} className="btn-primary w-full mt-3 disabled:opacity-50">
                {chargement ? 'Création¦' : 'Créer votre  compte et continuer'}
              </button>

              <button
                type="button"
                onClick={() => aller('confirmation-telephone')}
                className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 pt-1 transition-colors"
              >
                Déjà  inscrit ? Confirmer votre numéro
              </button>
            </CarteEtape>
          </form>
        )}

        {etape === 'confirmation-telephone' && (
          <form onSubmit={soumettreConfirmationTelephone}>
            <CarteEtape key="confirmation">
              <EnteteEtape
                badge="Connexion rapide"
                titre="Confirmer votre numéro"
                sousTitre="Saisissez le numéro déjà  utilisé pour vous inscrire."
              />

              <ChampTexte
                label="Téléphone"
                type="tel"
                required
                value={telephone}
                maxLength={9}
                placeholder="ex : 699000000"
                erreur={erreurTelephone}
                onChange={(e) => gererChangementTelephone(e.target.value.replace(/\D/g, ''))}
              />

              <button type="submit" disabled={chargement || !!erreurTelephone} className="btn-primary w-full mt-6 disabled:opacity-50">
                {chargement ? 'Vérification¦' : 'Confirmer et continuer'}
              </button>

              <BoutonRetour onClick={() => aller('inscription')} label="Retour à  l'inscription" />
            </CarteEtape>
          </form>
        )}

        {etape === 'completer-profil' && (
          <form onSubmit={soumettreCompleterProfil}>
            <CarteEtape key="profil" className="space-y-5">
              <EnteteEtape
                badge="Profil incomplet"
                titre="Compléter votre profil"
                sousTitre="Ville et quartier sont requis avant de publier une annonce."
              />

              <ChampTexte label="Ville" required value={ville} onChange={(e) => setVille(e.target.value)} />
              <ChampTexte label="Quartier" required value={quartier} onChange={(e) => setQuartier(e.target.value)} />

              <button type="submit" disabled={chargement} className="btn-primary w-full mt-2 disabled:opacity-50">
                {chargement ? 'Enregistrement¦' : 'Continuer'}
              </button>

              <BoutonRetour onClick={() => aller('confirmation-telephone')} label="Retour" />
            </CarteEtape>
          </form>
        )}

        {(etape === 'recto' || etape === 'verso') && (
          <CarteEtape key={etape} className="text-center">
            <EnteteEtape
              badge={etape === 'recto' ? 'Photo 1 / 2' : 'Photo 2 / 2'}
              titre={`Photographiez le ${etape === 'recto' ? 'recto' : 'verso'}`}
              sousTitre="Assurez-vous que la carte est bien lisible et bien éclairée."
            />

            <div className="mb-7 min-h-[12rem] flex items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 to-brand-50/40 border border-dashed border-brand-200/70 overflow-hidden relative group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.08),transparent_65%)]" />
              {(etape === 'recto' ? apercuRecto : apercuVerso) ? (
                <img
                  src={etape === 'recto' ? apercuRecto : apercuVerso}
                  alt={`Aperçu ${etape}`}
                  className="relative z-10 mx-auto rounded-2xl max-h-72 object-contain shadow-glow-lg animate-scale-in"
                />
              ) : (
                <div className="relative z-10 px-6 py-10">
                  <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-white shadow-soft border border-brand-100 flex items-center justify-center text-brand-500 animate-float">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">Aucune photo sélectionnée</p>
                </div>
              )}
            </div>

            <label className="btn-outline inline-block cursor-pointer">
              Choisir une photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const fichier = e.target.files?.[0]
                  if (!fichier) return
                  if (etape === 'recto') {
                    gererFichier(fichier, setFichierRecto, setApercuRecto, apercuRecto)
                  } else {
                    gererFichier(fichier, setFichierVerso, setApercuVerso, apercuVerso)
                  }
                }}
              />
            </label>

            <div className="mt-8">
              <button
                type="button"
                disabled={etape === 'recto' ? !fichierRecto : !fichierVerso}
                onClick={() => (etape === 'recto' ? aller('verso') : lancerExtraction())}
                className="btn-primary w-full disabled:opacity-40"
              >
                {etape === 'recto' ? 'Continuer vers le verso' : 'Extraire les informations'}
              </button>
            </div>

            <BoutonRetour
              onClick={() => aller(etape === 'recto' ? 'inscription' : 'recto')}
              label={etape === 'recto' ? 'Retour' : 'Retour au recto'}
            />
          </CarteEtape>
        )}

        {etape === 'extraction' && (
          <CarteEtape key="extraction" className="text-center py-6">
            <div className="relative mx-auto mb-8 h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-brand-400/20 animate-pulse-ring" />
              <div className="absolute inset-2 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-brand-500 shadow-glow" />
              </div>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">Extraction en cours</h1>
            <p className="text-slate-500 mb-5">Analyse automatique de la carte, patientez quelques secondes.</p>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden max-w-xs mx-auto">
              <div className="h-full w-2/3 rounded-full bg-shimmer bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600" />
            </div>
          </CarteEtape>
        )}

        {etape === 'formulaire' && (
          <CarteEtape key="formulaire">
            <EnteteEtape
              badge="Vérification"
              titre="Vérifiez les informations"
              sousTitre="Corrigez si nécessaire avant de continuer."
            />

            <div className="mb-7 flex flex-col sm:flex-row sm:items-end gap-4 p-4 rounded-2xl bg-gradient-to-br from-brand-50/80 to-white border border-brand-100/70">
              {champs.photo_titulaire_base64 ? (
                <img
                  src={`data:image/jpeg;base64,${champs.photo_titulaire_base64}`}
                  alt="Photo du titulaire"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-glow"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border border-dashed border-brand-200 bg-white/70 flex items-center justify-center text-[10px] text-slate-400 text-center px-2">
                  Photo manquante
                </div>
              )}
              <label className="btn-outline inline-block cursor-pointer text-sm !py-2.5 !px-4">
                {champs.photo_titulaire_base64 ? 'Remplacer la photo' : 'Ajouter la photo du titulaire'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => ajouterPhotoTitulaire(e.target.files?.[0])}
                />
              </label>
            </div>
            {erreursFormulaire.photo_titulaire_base64 && (
              <p className="text-red-600 text-xs -mt-4 mb-4">{erreursFormulaire.photo_titulaire_base64}</p>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ChampTexte
                  label="Nom"
                  value={champs.nom_titulaire}
                  erreur={erreursFormulaire.nom_titulaire}
                  onChange={(e) => modifierChamp('nom_titulaire', e.target.value)}
                />
                <ChampTexte
                  label="Prénom"
                  value={champs.prenom_titulaire}
                  erreur={erreursFormulaire.prenom_titulaire}
                  onChange={(e) => modifierChamp('prenom_titulaire', e.target.value)}
                />
              </div>
              <ChampTexte
                label="Date de naissance (AAAA-MM-JJ)"
                placeholder="1990-08-15"
                value={champs.date_naissance}
                erreur={erreursFormulaire.date_naissance}
                onChange={(e) => modifierChamp('date_naissance', e.target.value)}
              />
              <ChampTexte
                label="Lieu de naissance"
                value={champs.lieu_naissance}
                erreur={erreursFormulaire.lieu_naissance}
                onChange={(e) => modifierChamp('lieu_naissance', e.target.value)}
              />
              <ChampTexte
                label="Numéro de la carte"
                value={champs.numero_carte}
                erreur={erreursFormulaire.numero_carte}
                onChange={(e) => modifierChamp('numero_carte', e.target.value)}
              />
            </div>

            <button type="button" onClick={continuerDepuisFormulaire} className="btn-primary w-full mt-7">
              Continuer
            </button>
            <BoutonRetour onClick={() => aller('verso')} label="Retour aux photos" />
          </CarteEtape>
        )}

        {etape === 'position' && (
          <CarteEtape key="position">
            <EnteteEtape
              badge="Localisation"
              titre="Où se trouve la carte ?"
              sousTitre="Choisissez le lieu actuel de la CNI."
            />
            <div className="space-y-3 mb-6">
              {Object.entries(LIBELLES_POSITION).map(([valeur, libelle]) => (
                <label
                  key={valeur}
                  className={`flex items-center gap-3 border rounded-2xl px-4 py-4 cursor-pointer transition-all duration-300 ${
                    positionCni === valeur
                      ? 'border-brand-500 bg-gradient-to-r from-brand-50 to-white shadow-glow scale-[1.01]'
                      : 'border-slate-200/80 bg-white/50 hover:border-brand-300 hover:shadow-soft'
                  }`}
                >
                  <input
                    type="radio"
                    name="position"
                    value={valeur}
                    checked={positionCni === valeur}
                    onChange={(e) => {
                      setPositionCni(e.target.value)
                      setErreurPosition('')
                    }}
                    className="accent-brand-600 h-4 w-4"
                  />
                  <span className={`font-semibold ${positionCni === valeur ? 'text-brand-800' : 'text-slate-700'}`}>
                    {libelle}
                  </span>
                </label>
              ))}
            </div>

            {positionCni === 'autre' && (
              <div className="mb-5 animate-fade-up">
                <ChampTexte
                  label="Précisez le lieu"
                  required
                  value={positionPrecision}
                  placeholder="Ex : gare routière ,proche de la mosquée"
                  erreur={erreurPosition}
                  onChange={(e) => {
                    setPositionPrecision(e.target.value)
                    setErreurPosition('')
                  }}
                />
              </div>
            )}

            <button type="button" onClick={continuerDepuisPosition} className="btn-primary w-full">
              Continuer
            </button>
            <BoutonRetour onClick={() => aller('formulaire')} />
          </CarteEtape>
        )}

        {etape === 'resume' && (
          <CarteEtape key="resume">
            <EnteteEtape
              badge="Dernière étape"
              titre="Résumé de l'annonce"
              sousTitre="Vérifiez une dernière fois avant de publier tout en vous rassurant que les informations sont bien celles de la carte nationale d'identité en votre possession."
            />

            {champs.photo_titulaire_base64 && (
              <div className="mb-6 flex justify-center">
                <img
                  src={`data:image/jpeg;base64,${champs.photo_titulaire_base64}`}
                  alt="Photo du titulaire"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-glow"
                />
              </div>
            )}

            <dl className="space-y-0 mb-8 text-sm rounded-2xl overflow-hidden border border-brand-100/80 bg-gradient-to-br from-white to-brand-50/40 shadow-soft">
              {[
                ['Nom', champs.nom_titulaire],
                ['Prénom', champs.prenom_titulaire],
                ['Date de naissance', champs.date_naissance],
                ['Lieu de naissance', champs.lieu_naissance],
                ['Numéro de carte', champs.numero_carte],
                [
                  'Position',
                  `${LIBELLES_POSITION[positionCni] || positionCni}${
                    positionPrecision ? ` — ${positionPrecision}` : ''
                  }`,
                ],
              ].map(([libelle, valeur]) => (
                <div
                  key={libelle}
                  className="flex justify-between gap-4 border-b border-brand-50/90 px-5 py-3.5 last:border-0 hover:bg-white/60 transition-colors"
                >
                  <dt className="text-slate-400 font-medium">{libelle}</dt>
                  <dd className="font-semibold text-slate-800 text-right">{valeur || '—'}</dd>
                </div>
              ))}
            </dl>

            <button type="button" onClick={publier} disabled={chargement} className="btn-primary w-full disabled:opacity-50 animate-shine">
              {chargement ? 'Publication¦' : "Publier l'annonce"}
            </button>
            <BoutonRetour onClick={() => aller('position')} />
          </CarteEtape>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Publication

