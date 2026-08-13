import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HeaderAccueil = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigue = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, hash) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigue('/' + hash);
    } else {
      const element = document.querySelector(hash);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allerVersChoix = () => navigue('/choix-espace');

  const liens = [
    { hash: '#accueil', libelle: 'Accueil' },
    { hash: '#processus', libelle: 'Comment ça marche' },
    { hash: '#fonctionnalites', libelle: 'Fonctionnalités' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(2,132,199,0.08)]' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div onClick={() => navigue('/')} className="cursor-pointer flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 group-hover:scale-105 transition-all duration-300">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              CNI<span className="text-gradient">Finder</span>
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-9 text-sm font-semibold text-slate-600">
            {liens.map((lien) => (
              <a
                key={lien.hash}
                href={lien.hash}
                onClick={(e) => handleNavClick(e, lien.hash)}
                className="relative py-2 hover:text-brand-600 transition-colors group"
              >
                {lien.libelle}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex">
            <button
              onClick={allerVersChoix}
              className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <span className="relative z-10 flex items-center gap-2">
                Connexion
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-0.5">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          </div>

          <button
            className="lg:hidden p-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu de navigation"
          >
            <div className={`w-5 h-0.5 bg-slate-700 mb-1.5 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-slate-700 mb-1.5 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-slate-700 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl px-6 py-5 space-y-1">
          {liens.map((lien) => (
            <a
              key={lien.hash}
              href={lien.hash}
              onClick={(e) => handleNavClick(e, lien.hash)}
              className="block py-2.5 text-slate-700 font-semibold hover:text-brand-600 transition-colors"
            >
              {lien.libelle}
            </a>
          ))}
          <button onClick={allerVersChoix} className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
            Connexion
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default HeaderAccueil;
