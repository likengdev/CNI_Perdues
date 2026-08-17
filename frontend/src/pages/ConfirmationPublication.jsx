import { useNavigate } from 'react-router-dom'
import HeaderPublication from '../components/annonces/HeaderPublication'
import FooterPublication from '../components/annonces/FooterPublication'

function ConfirmationPublication() {
  const navigue = useNavigate()
  return (
    <div className="min-h-screen bg-[#f4f9ff] flex flex-col font-sans relative overflow-hidden selection:bg-brand-500 selection:text-white">
      <HeaderPublication indexActif={4} />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(14,165,233,0.1),_transparent_50%)] pointer-events-none" />
      <div className="absolute top-16 left-[10%] w-[420px] h-[420px] bg-success/20 blur-[120px] rounded-full pointer-events-none animate-glow-drift mix-blend-multiply" />
      <div className="absolute bottom-[10%] right-[5%] w-[380px] h-[380px] bg-brand-400/20 blur-[110px] rounded-full pointer-events-none animate-glow-drift mix-blend-multiply" style={{ animationDelay: '1.5s' }} />

      <main className="flex-grow max-w-lg w-full mx-auto px-6 pt-28 pb-14 text-center relative z-10">
        <div className="pub-card p-10 sm:p-12">
          <div className="absolute -top-20 -right-16 w-48 h-48 bg-success/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10">
            <div className="relative mx-auto mb-7 h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-success/20 animate-pulse-ring" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-success text-white flex items-center justify-center shadow-glow">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Annonce envoyée</h1>
            <p className="text-slate-500 mb-9 leading-relaxed">
              Votre annonce a été envoyée à l'administrateur pour validation.
              Elle sera visible dès qu'elle sera approuvée.
            </p>
            <button type="button" onClick={() => navigue('/')} className="btn-primary w-full sm:w-auto animate-shine">
              Retour à l'accueil
            </button>
          </div>
        </div>
      </main>
      <FooterPublication />
    </div>
  )
}

export default ConfirmationPublication
