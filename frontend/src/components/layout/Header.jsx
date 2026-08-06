import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AnimateOnScroll from '../AnimateOnScroll';

const Header = () => {
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

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <AnimateOnScroll animation="fade-right" className="flex items-center gap-2">
          <div onClick={() => navigue('/')} className="cursor-pointer flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800">CNI<span className="text-brand-600">Finder</span></span>
          </div>
        </AnimateOnScroll>

        <nav className="hidden md:flex gap-8 font-medium text-slate-600">
          <a href="#accueil" onClick={(e) => handleNavClick(e, '#accueil')} className="hover:text-brand-600 transition-colors cursor-pointer">Accueil</a>
          <a href="#processus" onClick={(e) => handleNavClick(e, '#processus')} className="hover:text-brand-600 transition-colors cursor-pointer">Comment ça marche</a>
          <a href="#fonctionnalites" onClick={(e) => handleNavClick(e, '#fonctionnalites')} className="hover:text-brand-600 transition-colors cursor-pointer">Fonctionnalités</a>
        </nav>

        <div className="hidden md:flex gap-3">
          <button onClick={allerVersChoix} className="btn-primary !px-5 !py-2 !text-sm">
            Connexion
          </button>
        </div>

        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          <div className="w-6 h-0.5 bg-slate-700 mb-1.5"></div>
          <div className="w-6 h-0.5 bg-slate-700 mb-1.5"></div>
          <div className="w-6 h-0.5 bg-slate-700"></div>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-3">
          <a href="#accueil" onClick={(e) => handleNavClick(e, '#accueil')} className="block text-slate-700 font-medium">Accueil</a>
          <a href="#processus" onClick={(e) => handleNavClick(e, '#processus')} className="block text-slate-700 font-medium">Comment ça marche</a>
          <a href="#fonctionnalites" onClick={(e) => handleNavClick(e, '#fonctionnalites')} className="block text-slate-700 font-medium">Fonctionnalités</a>
          <button onClick={allerVersChoix} className="btn-primary w-full mt-2">Connexion</button>
        </div>
      )}
    </header>
  );
};

export default Header;