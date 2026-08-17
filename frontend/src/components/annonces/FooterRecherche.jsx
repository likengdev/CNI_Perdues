/**
 * Pied de page dédié au parcours « Rechercher une CNI ».
 * Léger, élégant, en cohérence avec l'identité du parcours public.
 */
function FooterRecherche() {
  return (
    <footer className="relative z-10 mt-auto px-5 sm:px-6 pb-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-brand-100/70 bg-white/70 backdrop-blur-xl px-6 py-4 shadow-soft">
        <p className="text-xs text-slate-500">
          © 2026 <span className="font-semibold text-slate-700">CNIFinder</span> · Recherche d'une CNI perdue
        </p>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Recherche confidentielle · Données protégées
        </div>
      </div>
    </footer>
  )
}

export default FooterRecherche
