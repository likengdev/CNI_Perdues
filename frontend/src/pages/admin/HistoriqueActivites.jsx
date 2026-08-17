import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Clock,
  Download,
  Eye,
  FilterX,
  Megaphone,
  Search,
  Sparkles,
  Undo2,
  UserPlus,
  XCircle,
} from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import clientApi, { extraireMessageErreur } from '../../api/client'

const PAR_PAGE = 8

const CONFIGS_ACTION = {
  publication: { libelle: 'Publication', Icon: Megaphone, bulle: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700 border-sky-200', puce: 'bg-sky-500' },
  validation: { libelle: 'Validation', Icon: BadgeCheck, bulle: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', puce: 'bg-emerald-500' },
  rejet: { libelle: 'Rejet', Icon: XCircle, bulle: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', puce: 'bg-red-500' },
  consultation: { libelle: 'Consultation', Icon: Eye, bulle: 'bg-slate-500', badge: 'bg-slate-100 text-slate-600 border-slate-200', puce: 'bg-slate-500' },
  restitution: { libelle: 'Restitution', Icon: Undo2, bulle: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200', puce: 'bg-violet-500' },
  inscription: { libelle: 'Inscription', Icon: UserPlus, bulle: 'bg-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200', puce: 'bg-teal-500' },
  autre: { libelle: 'Autre', Icon: Sparkles, bulle: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', puce: 'bg-amber-500' },
}

const ORDRE_CARTES = [
  { cle: 'total', libelle: 'Total', Icon: Activity, bulle: 'bg-indigo-500' },
  { cle: 'publication', libelle: 'Publications', Icon: Megaphone, bulle: 'bg-sky-500' },
  { cle: 'validation', libelle: 'Validations', Icon: BadgeCheck, bulle: 'bg-emerald-500' },
  { cle: 'restitution', libelle: 'Restitutions', Icon: Undo2, bulle: 'bg-violet-500' },
  { cle: 'rejet', libelle: 'Rejets', Icon: XCircle, bulle: 'bg-red-500' },
  { cle: 'consultation', libelle: 'Consultations', Icon: Eye, bulle: 'bg-slate-500' },
  { cle: 'inscription', libelle: 'Inscriptions', Icon: UserPlus, bulle: 'bg-teal-500' },
  { cle: 'autre', libelle: 'Autres', Icon: Sparkles, bulle: 'bg-amber-500' },
]

const formaterDate = (valeur) => {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formaterDateCourt = (valeur) => {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formaterHeure = (valeur) => {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const cleJour = (valeur) => {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return 'inconnu'
  return date.toDateString()
}

const libelleJour = (valeur) => {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  const debutAujourdhui = new Date()
  debutAujourdhui.setHours(0, 0, 0, 0)
  const debutJour = new Date(date)
  debutJour.setHours(0, 0, 0, 0)
  const difference = Math.round((debutAujourdhui - debutJour) / 86400000)
  if (difference === 0) return "Aujourd'hui"
  if (difference === 1) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

const tempsRelatif = (valeur) => {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return '—'
  const difference = Date.now() - date.getTime()
  const minutes = Math.floor(difference / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const heures = Math.floor(minutes / 60)
  if (heures < 24) return `il y a ${heures} h`
  const jours = Math.floor(heures / 24)
  if (jours < 7) return `il y a ${jours} j`
  return formaterDate(valeur)
}

const initiales = (h) => `${(h.utilisateur_prenom || '').charAt(0)}${(h.utilisateur_nom || '').charAt(0)}`.toUpperCase()

const nomComplet = (h) => [h.utilisateur_prenom, h.utilisateur_nom].filter(Boolean).join(' ') || 'Utilisateur inconnu'

const STYLE_CHAMPS = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/60 transition-all'

function exporterPDF(entrees, stats) {
  const dateExport = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const lignesTableau = entrees.map((h) => {
    const cfg = CONFIGS_ACTION[h.type_action] || CONFIGS_ACTION.autre
    return `<tr>
      <td>${formaterDateCourt(h.date_creation)}</td>
      <td>${formaterHeure(h.date_creation)}</td>
      <td>${nomComplet(h)}</td>
      <td><span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:700;background:#f1f5f9;color:#334155;">${cfg.libelle}</span></td>
      <td>${h.description || '—'}</td>
    </tr>`
  }).join('')

  const statsHtml = stats ? `
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-size:12px;color:#475569;">
      <span><strong>Total :</strong> ${stats.total ?? 0}</span>
      <span><strong>Publications :</strong> ${stats.par_type?.publication ?? 0}</span>
      <span><strong>Validations :</strong> ${stats.par_type?.validation ?? 0}</span>
      <span><strong>Restitutions :</strong> ${stats.par_type?.restitution ?? 0}</span>
      <span><strong>Rejets :</strong> ${stats.par_type?.rejet ?? 0}</span>
      <span><strong>Consultations :</strong> ${stats.par_type?.consultation ?? 0}</span>
      <span><strong>Inscriptions :</strong> ${stats.par_type?.inscription ?? 0}</span>
    </div>
  ` : ''

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Journal d'activité - CNIFinder</title>
<style>
  @page { size: A4 landscape; margin: 15mm; }
  @media print { .no-print { display: none !important; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; padding: 20px; }
  .header { margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
  .header h1 { font-size: 20px; font-weight: 800; color: #0f172a; }
  .header p { font-size: 12px; color: #64748b; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #0f172a; color: #fff; padding: 10px 12px; text-align: left; font-weight: 700; font-size: 11px; }
  td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  tr:nth-child(even) { background: #f8fafc; }
  tr:hover { background: #f1f5f9; }
  .footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
  .print-btn { position: fixed; top: 20px; right: 20px; z-index: 1000; padding: 10px 24px; background: #0ea5e9; color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(14,165,233,0.3); }
  .print-btn:hover { background: #0284c7; }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
  <div class="header">
    <h1>Journal d'activite — CNIFinder</h1>
    <p>Export genere le ${dateExport}</p>
  </div>
  ${statsHtml}
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Heure</th>
        <th>Utilisateur</th>
        <th>Action</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      ${lignesTableau || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:30px;">Aucune activite a exporter.</td></tr>'}
    </tbody>
  </table>
  <div class="footer">
    <span>CNIFinder — Journal d'activite</span>
    <span>${entrees.length} entree${entrees.length > 1 ? 's' : ''}</span>
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const fenetre = window.open(url, '_blank')
  if (fenetre) {
    fenetre.onload = () => URL.revokeObjectURL(url)
  }
}

function HistoriqueActivites() {
  const [entrees, setEntrees] = useState([])
  const [stats, setStats] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [texte, setTexte] = useState('')
  const [filtreRecherche, setFiltreRecherche] = useState('')
  const [filtreType, setFiltreType] = useState('')
  const [filtreDepuis, setFiltreDepuis] = useState('')
  const [filtreJusqua, setFiltreJusqua] = useState('')
  const [visible, setVisible] = useState(PAR_PAGE)
  const [exportEnCours, setExportEnCours] = useState(false)

  useEffect(() => {
    let actif = true
    clientApi.get('/admin/historique/stats/')
      .then(({ data }) => { if (actif) setStats(data) })
      .catch(() => {})
    return () => { actif = false }
  }, [])

  useEffect(() => {
    const minuteur = setTimeout(() => setFiltreRecherche(texte.trim()), 300)
    return () => clearTimeout(minuteur)
  }, [texte])

  useEffect(() => {
    let actif = true
    const charger = async () => {
      setChargement(true)
      setErreur('')
      try {
        const params = new URLSearchParams()
        if (filtreType) params.set('type_action', filtreType)
        if (filtreRecherche) params.set('recherche', filtreRecherche)
        if (filtreDepuis) params.set('depuis', filtreDepuis)
        if (filtreJusqua) params.set('jusqua', filtreJusqua)
        const chaine = params.toString()
        const { data } = await clientApi.get(`/admin/historique/${chaine ? `?${chaine}` : ''}`)
        if (!actif) return
        setEntrees(data)
        setVisible(PAR_PAGE)
      } catch (err) {
        if (actif) setErreur(extraireMessageErreur(err, "Impossible de charger l'historique."))
      } finally {
        if (actif) setChargement(false)
      }
    }
    charger()
    return () => { actif = false }
  }, [filtreType, filtreRecherche, filtreDepuis, filtreJusqua])

  const entreesVisibles = entrees.slice(0, visible)

  const groupes = useMemo(() => {
    const resultats = []
    for (const h of entreesVisibles) {
      const cle = cleJour(h.date_creation)
      const dernier = resultats[resultats.length - 1]
      if (dernier && dernier.cle === cle) {
        dernier.items.push(h)
      } else {
        resultats.push({ cle, libelle: libelleJour(h.date_creation), items: [h] })
      }
    }
    return resultats
  }, [entreesVisibles])

  const filtresActifs = Boolean(filtreType || texte || filtreDepuis || filtreJusqua)

  const basculerFiltreType = (cle) => {
    if (cle === 'total') {
      setFiltreType('')
    } else {
      setFiltreType(filtreType === cle ? '' : cle)
    }
  }

  const reinitialiserFiltres = () => {
    setTexte('')
    setFiltreRecherche('')
    setFiltreType('')
    setFiltreDepuis('')
    setFiltreJusqua('')
  }

  const valeurCarte = (cle) => {
    if (cle === 'total') return stats?.total ?? 0
    return stats?.par_type?.[cle] ?? 0
  }

  const gererExportPDF = () => {
    setExportEnCours(true)
    try {
      exporterPDF(entrees, stats)
    } catch {
      setErreur("Erreur lors de l'export. Réessayez.")
    } finally {
      setExportEnCours(false)
    }
  }

  return (
    <MiseEnPageAdmin titre="Historique">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Journal d'activité</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Historique des activités</h1>
            <p className="text-slate-500 mt-1">Trace complète et vérifiable de toutes les actions effectuées sur la plateforme.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white text-slate-700 font-semibold text-sm rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2">
              <Activity size={16} className="text-brand-500" />
              <span>{entrees.length} entrée{entrees.length > 1 ? 's' : ''}</span>
            </div>
            <button
              type="button"
              onClick={gererExportPDF}
              disabled={exportEnCours || entrees.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
            >
              <Download size={16} />
              {exportEnCours ? 'Export...' : 'Exporter PDF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {ORDRE_CARTES.map((carte) => {
            const actif = carte.cle !== 'total' && filtreType === carte.cle
            return (
              <motion.button
                key={carte.cle}
                type="button"
                onClick={() => basculerFiltreType(carte.cle)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group text-left bg-white rounded-2xl border p-4 shadow-sm transition-all ${
                  actif
                    ? 'border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-slate-200/70 hover:border-brand-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`h-10 w-10 rounded-xl ${carte.bulle} text-white flex items-center justify-center shadow-sm shrink-0`}>
                    <carte.Icon size={18} />
                  </span>
                  <span className="text-2xl font-bold text-slate-800 tabular-nums">{valeurCarte(carte.cle)}</span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500 truncate">{carte.libelle}</p>
              </motion.button>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_180px_160px_160px_auto] gap-3 items-end">
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                placeholder="Rechercher un nom ou une description..."
                className={`${STYLE_CHAMPS} pl-10`}
              />
            </div>
            <select value={filtreType} onChange={(e) => setFiltreType(e.target.value)} className={STYLE_CHAMPS}>
              <option value="">Tous les types</option>
              {Object.entries(CONFIGS_ACTION).map(([cle, cfg]) => (
                <option key={cle} value={cle}>{cfg.libelle}</option>
              ))}
            </select>
            <input
              type="date"
              value={filtreDepuis}
              onChange={(e) => setFiltreDepuis(e.target.value)}
              aria-label="À partir du"
              className={STYLE_CHAMPS}
            />
            <input
              type="date"
              value={filtreJusqua}
              onChange={(e) => setFiltreJusqua(e.target.value)}
              aria-label="Jusqu'au"
              className={STYLE_CHAMPS}
            />
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {filtresActifs && (
                  <motion.button
                    type="button"
                    onClick={reinitialiserFiltres}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <FilterX size={16} />
                    Réinitialiser
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {erreur && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 text-sm rounded-2xl px-6 py-4 border border-red-100 mb-6 flex items-center gap-3 shadow-sm">
            <AlertCircle size={20} />
            <span>{erreur}</span>
          </motion.div>
        )}

        {chargement ? (
          <div className="space-y-4" aria-label="Chargement">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 h-10 w-10 rounded-full bg-slate-200 animate-pulse"></div>
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-3"></div>
                  <div className="h-3 w-full bg-slate-100 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <span className="absolute left-5 top-6 bottom-10 w-px bg-slate-200" aria-hidden="true"></span>
            {groupes.map((groupe) => (
              <div key={groupe.cle}>
                <div className="sticky top-2 z-20 mb-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-800/90 text-white px-4 py-1.5 text-xs font-bold shadow-lg backdrop-blur">
                    <CalendarDays size={14} />
                    {groupe.libelle}
                    <span className="text-slate-300 font-semibold">· {groupe.items.length}</span>
                  </span>
                </div>

                <div className="space-y-6">
                  {groupe.items.map((h) => {
                    const cfg = CONFIGS_ACTION[h.type_action] || CONFIGS_ACTION.autre
                    return (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative pl-16"
                      >
                        <span className={`absolute left-0 top-0 h-10 w-10 rounded-full ${cfg.bulle} text-white flex items-center justify-center ring-4 ring-slate-50 shadow-md z-10`}>
                          <cfg.Icon size={16} />
                        </span>
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-brand-200/70 transition-all">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                                {initiales(h)}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{nomComplet(h)}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{formaterDate(h.date_creation)} · {formaterHeure(h.date_creation)}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${cfg.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.puce}`}></span>
                              {cfg.libelle}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{h.description}</p>
                          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                            <Clock size={12} />
                            {tempsRelatif(h.date_creation)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}

            {!chargement && !erreur && entrees.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                <Activity size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-600">Aucune activité trouvée.</p>
                <p className="text-sm text-slate-400 mt-1">
                  {filtresActifs ? 'Modifiez ou effacez vos filtres pour élargir la recherche.' : 'Les actions importantes apparaîtront ici.'}
                </p>
                {filtresActifs && (
                  <button
                    type="button"
                    onClick={reinitialiserFiltres}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
                  >
                    <FilterX size={16} />
                    Effacer les filtres
                  </button>
                )}
              </div>
            )}

            {!chargement && !erreur && entrees.length > visible && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAR_PAGE)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/60 rounded-xl shadow-sm transition-colors"
                >
                  <Activity size={16} />
                  Afficher plus d'activités ({entrees.length - visible} restante{entrees.length - visible > 1 ? 's' : ''})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MiseEnPageAdmin>
  )
}

export default HistoriqueActivites
