import { useNavigate } from 'react-router-dom'

const ETAPES_RECHERCHE = [
  { id: 'inscription', label: 'Inscription' },
  { id: 'recherche', label: 'Recherche' },
  { id: 'resultats', label: 'Résultats' },
]

/**
 * Barre supérieure dédiée au parcours « Rechercher une CNI ».
 * Reprend l'identité du parcours de publication, adaptée à la recherche.
 */
function HeaderRecherche({ indexActif = 0 }) {
  const navigue = useNavigate()
  const nbEtapes = ETAPES_RECHERCHE.length
  const progression = Math.round((indexActif / Math.max(nbEtapes - 1, 1)) * 100)

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-brand-600 via-brand-400 to-success transition-all duration-700"
          style={{ width: `${progression}%` }}
        />
      </div>
      <div className="bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_10px_35px_rgba(2,132,199,0.07)]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            onClick={() => navigue('/')}
            className="group flex items-center gap-3 shrink-0"
            title="Retour à l'accueil"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-glow transition-transform duration-300 group-hover:scale-105">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
              </svg>
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                CNI<span className="text-brand-600">Finder</span>
              </span>
              <span className="text-[10px] font-bold text-brand-600/90 uppercase tracking-[0.14em]">
                Recherche CNI
              </span>
            </span>
          </button>

          <nav aria-label="Progression" className="hidden md:flex items-center gap-1">
            {ETAPES_RECHERCHE.map((etape, index) => {
              const actif = index === indexActif
              const passe = index < indexActif
              return (
                <div key={etape.id} className="flex items-center gap-1.5">
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
                    {etape.label}
                  </span>
                  {index < ETAPES_RECHERCHE.length - 1 && (
                    <span className="mx-1 h-px w-4 bg-slate-200" />
                  )}
                </div>
              )
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-block text-xs font-bold text-slate-400 tracking-wide">
              Étape <span className="text-brand-600">{Math.min(indexActif + 1, nbEtapes)}</span>/{nbEtapes}
            </span>
            <button
              onClick={() => navigue('/')}
              className="btn-outline !px-4 !py-2 !text-sm inline-flex items-center gap-2"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Accueil
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderRecherche
