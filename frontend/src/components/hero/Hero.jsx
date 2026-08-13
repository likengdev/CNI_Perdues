import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../AnimateOnScroll';

const Hero = () => {
  const navigue = useNavigate();

  return (
    <section id="accueil" className="relative pt-36 pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.10),_transparent_55%)] pointer-events-none"></div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(2,132,199,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,132,199,0.04)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <AnimateOnScroll animation="fade-down" delay={100}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-brand-700 px-4 py-2 rounded-full text-sm font-semibold border border-brand-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
              </span>
              Portail Citoyen Sécurisé
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={200}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Retrouvez vos <span className="text-gradient">Cartes d'Identité</span> rapidement et en toute sécurité.
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={300}>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-xl">
              Une plateforme de confiance pour signaler, rechercher et
              récupérer les cartes nationales d'identité perdues, avec
              validation administrative et vérification sécurisée.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={400}>
            <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={() => navigue('/publication')}
                className="btn-primary !px-8 !py-4 !text-base inline-flex items-center gap-2"
              >
                Signaler une CNI trouvée
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => navigue('/recherche')}
                className="btn-outline !px-8 !py-4 !text-base inline-flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21L16.65 16.65" strokeLinecap="round"/>
                </svg>
                Rechercher ma CNI
              </button>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={500}>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Validation admin</p>
                  <p className="text-xs text-slate-500">Chaque annonce est vérifiée</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-brand-600 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Données protégées</p>
                  <p className="text-xs text-slate-500">Coordonnées jamais exposées</p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        <AnimateOnScroll animation="zoom-in" delay={300}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500/20 via-transparent to-success/20 rounded-[2.5rem] blur-2xl"></div>
            <img
              src="/cnilabb.jpg"
              alt="Carte d'identité sur un bureau"
              className="relative rounded-3xl shadow-2xl w-full object-cover h-[400px] lg:h-[520px] animate-float"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-card border border-white/60 flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success relative shrink-0">
                <div className="absolute inset-0 bg-success/20 rounded-full animate-pulse-ring"></div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800">Système Vérifié</p>
                <p className="text-xs text-slate-500">Conforme aux normes de protection des données.</p>
              </div>
            </div>

            <div className="absolute -top-5 -right-4 hidden sm:flex items-center gap-2.5 bg-white/90 backdrop-blur-xl rounded-2xl shadow-card border border-white/60 px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Scan OCR</p>
                <p className="text-[11px] text-slate-500">Lecture recto / verso</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default Hero;
