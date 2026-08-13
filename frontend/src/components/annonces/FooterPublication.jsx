/**
 * Pied de page dédié au parcours « Publier une annonce ».
 * Remplace le Footer global : léger, élégant, en cohérence avec la nouvelle identité.
 */
function FooterPublication() {
  return (
    <footer className="relative z-10 mt-auto px-5 sm:px-6 pb-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-brand-100/70 bg-white/70 backdrop-blur-xl px-6 py-4 shadow-soft">
        <p className="text-xs text-slate-500">
          © 2026 <span className="font-semibold text-slate-700">CNIFinder</span> · Déclaration d'une CNI retrouvée
        </p>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Déclaration confidentielle · Validation par l'administration
        </div>
      </div>
    </footer>
  )
}

export default FooterPublication
