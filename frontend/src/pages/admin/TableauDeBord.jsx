import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, UserCheck, UserPlus, FileText,
  CheckCircle, ShieldCheck,
  Activity, Bell, ChevronRight, CalendarDays, RefreshCw
} from 'lucide-react'
import MiseEnPageAdmin from '../../components/layout/MiseEnPageAdmin'
import CarteStatistique from '../../components/communs/CarteStatistique'
import GraphiqueRestitutions from '../../components/admin/GraphiqueRestitutions'
import { obtenirStatsDashboard, obtenirRestitutionsMensuelles } from '../../api/administration'
import { extraireMessageErreur } from '../../api/client'
import { useAdmin } from '../../contexte/ContexteAdmin'

const STYLES_STATUT_ANNONCE = {
  en_attente: { libelle: 'En attente', classes: 'bg-amber-50 text-amber-600 border-amber-200/50' },
  publiee: { libelle: 'Publiée', classes: 'bg-emerald-50 text-emerald-600 border-emerald-200/50' },
  en_cours: { libelle: 'En restitution', classes: 'bg-violet-50 text-violet-600 border-violet-200/50' },
  restituee: { libelle: 'Restituée', classes: 'bg-pink-50 text-pink-600 border-pink-200/50' },
  rejetee: { libelle: 'Rejetée', classes: 'bg-red-50 text-red-600 border-red-200/50' },
}

const stylesStatutAnnonce = (statut) =>
  STYLES_STATUT_ANNONCE[statut] || {
    libelle: (statut || '—').replace(/_/g, ' '),
    classes: 'bg-slate-100 text-slate-600 border-slate-200/50',
  }

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

function TableauDeBord() {
  const { token, admin } = useAdmin()
  const navigue = useNavigate()
  const [stats, setStats] = useState(null)
  const [restitutionsMensuelles, setRestitutionsMensuelles] = useState([])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)
  const [rafraichissement, setRafraichissement] = useState(false)

  const charger = async () => {
    try {
      const [reponseStats, reponseGraphique] = await Promise.all([
        obtenirStatsDashboard(token),
        obtenirRestitutionsMensuelles(token),
      ])
      setStats(reponseStats.data)
      setRestitutionsMensuelles(reponseGraphique.data)
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'Impossible de charger les statistiques.'))
    } finally {
      setChargement(false)
      setRafraichissement(false)
    }
  }

  useEffect(() => {
    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const rafraichir = () => {
    setErreur('')
    setRafraichissement(true)
    charger()
  }

  if (chargement) {
    return (
      <MiseEnPageAdmin titre="Tableau de bord">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 animate-pulse">Chargement des statistiques...</p>
        </div>
      </MiseEnPageAdmin>
    )
  }

  if (erreur) {
    return (
      <MiseEnPageAdmin titre="Tableau de bord">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-700 text-sm rounded-2xl px-6 py-4 border border-red-100 flex items-center space-x-3"
        >
          <Bell className="w-5 h-5" />
          <span>{erreur}</span>
        </motion.div>
      </MiseEnPageAdmin>
    )
  }

  return (
    <MiseEnPageAdmin titre="Vue d'ensemble">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Tableau de bord</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Bonjour {admin?.nom || 'Administrateur'}
            </h1>
            <p className="text-slate-500 mt-1">Voici le résumé de l'activité sur la plateforme.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2 text-sm text-slate-600">
              <CalendarDays size={16} className="text-brand-500" />
              <span className="font-medium capitalize">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button
              onClick={rafraichir}
              disabled={rafraichissement}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={rafraichissement ? 'animate-spin' : ''} />
              Rafraîchir
            </button>
          </div>
        </div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <CarteStatistique libelle="Utilisateurs inscrits" valeur={stats.nombre_total_utilisateurs} couleur="#6366f1" icon={Users} />
          <CarteStatistique libelle="Déclarants" valeur={stats.nombre_declarants} couleur="#0ea5e9" icon={UserPlus} />
          <CarteStatistique libelle="Bénéficiaires" valeur={stats.nombre_beneficiaires} couleur="#14b8a6" icon={UserCheck} />
          <CarteStatistique libelle="Annonces au total" valeur={stats.annonces_total} couleur="#64748b" icon={FileText} />
          <CarteStatistique libelle="Annonces publiées" valeur={stats.annonces_publiees} couleur="#10b981" icon={CheckCircle} />
          <CarteStatistique libelle="CNI restituées" valeur={stats.cni_restituees} couleur="#ec4899" icon={ShieldCheck} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <Activity size={18} />
                </div>
                <h2 className="font-semibold text-slate-800">Dernières annonces</h2>
              </div>
              <button
                onClick={() => navigue('/admin/annonces/publiees')}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center group transition-colors"
              >
                Voir tout <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="space-y-4">
              {stats.dernieres_annonces?.length ? (
                stats.dernieres_annonces.map((a, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    key={a.id}
                    className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium">
                        {a.prenom_titulaire.charAt(0)}{a.nom_titulaire.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 group-hover:text-brand-600 transition-colors">
                          {a.prenom_titulaire} {a.nom_titulaire}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">ID: #{a.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border whitespace-nowrap ${stylesStatutAnnonce(a.statut).classes}`}>
                      {stylesStatutAnnonce(a.statut).libelle}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm">Aucune annonce pour le moment.</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GraphiqueRestitutions donnees={restitutionsMensuelles} />
          </motion.div>
        </div>
      </motion.div>
    </MiseEnPageAdmin>
  )
}

export default TableauDeBord