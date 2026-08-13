import { useNavigate } from 'react-router-dom'

/**
 * Barre supérieure dédiée au parcours « Publier une annonce ».
 * Remplace le Header global : identité propre à la déclaration d'une CNI.
 */
function HeaderPublication({ indexActif = 0, totalEtapes = 5 }) {
  const navigue = useNavigate()
  const progression = Math.round((indexActif / Math.max(totalEtapes - 1, 1)) * 100)

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
                Déclaration CNI
              </span>
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-3.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-xs font-semibold text-brand-700">Parcours sécurisé</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-block text-xs font-bold text-slate-400 tracking-wide">
              Étape <span className="text-brand-600">{Math.min(indexActif + 1, totalEtapes)}</span>/{totalEtapes}
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

export default HeaderPublication
