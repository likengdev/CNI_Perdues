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

function CarteEtape({ children, className = '' }) {
  return (
    <div className={`pub-card p-8 sm:p-10 ${className}`}>
      <div className="absolute -top-24 -right-24 w-56 h-56 bg-brand-400/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-16 w-48 h-48 bg-success/10 blur-3xl rounded-full pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function EnteteEtape({ badge, titre, sousTitre, icone }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        {icone && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
            {icone}
          </span>
        )}
        {badge && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-xs font-semibold text-brand-700 tracking-wide uppercase">{badge}</span>
          </div>
        )}
      </div>
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

function BoutonRetour({ onClick, label = 'Retour' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-center text-sm text-slate-500 font-medium hover:text-brand-600 pt-5 transition-all duration-300"
    >
      <span className="inline-flex items-center gap-2">
        <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
        {label}
      </span>
    </button>
  )
}

export { FondLumineux, CarteEtape, EnteteEtape, ChampTexte, BoutonRetour }
