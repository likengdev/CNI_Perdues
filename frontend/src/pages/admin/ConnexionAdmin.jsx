import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { connexionAdmin } from '../../api/administration'
import { extraireMessageErreur } from '../../api/client'
import { useAdmin } from '../../contexte/ContexteAdmin'

function ConnexionAdmin() {
  const navigue = useNavigate()
  const { connecter } = useAdmin()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false)

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const { data } = await connexionAdmin(email, motDePasse)
      connecter(data.access, null)
      navigue('/admin')
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'Email ou mot de passe incorrect.'))
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef0fb] via-[#eef1f8] to-white flex items-center justify-center px-6 py-12">
      {/* Bloc unique : image + carte collées, un seul cadre / une seule ombre */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-[28px] shadow-xl overflow-hidden bg-white">
        {/* Visuel gauche */}
        <div className="hidden md:block aspect-square">
          <img
            src="/ordi.png"
            alt="Laboratoire de recherche moderne"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Carte de connexion */}
        <div className="w-full mx-auto p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">CNIFinder</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Bienvenue sur L'Espace Admin</h1>
          <p className="text-slate-500 text-sm mb-8">Connectez-vous en toute Sécurité.</p>

          <form onSubmit={soumettre} className="space-y-5">
            {erreur && (
              <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100">
                {erreur}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/60 border border-slate-200 rounded-full text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={afficherMotDePasse ? 'text' : 'password'}
                  required
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50/60 border border-slate-200 rounded-full text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setAfficherMotDePasse((v) => !v)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={afficherMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {afficherMotDePasse ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={chargement}
              className="w-full mt-2 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200 hover:opacity-90 transition disabled:opacity-50"
            >
              {chargement ? 'Connexion…' : 'Se Connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ConnexionAdmin