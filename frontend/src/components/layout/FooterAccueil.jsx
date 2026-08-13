import { Link, useNavigate, useLocation } from 'react-router-dom';

const FooterAccueil = () => {
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
  };

  return (
    <footer className="relative bg-marine-900 text-slate-300 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent"></div>
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-600/10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8 relative">
        <div className="grid md:grid-cols-4 gap-10 md:gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                CNI<span className="text-brand-400">Finder</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-6 text-slate-400">
              La plateforme de référence pour la récupération des documents
              d'identité perdus. Nous connectons les citoyens honnêtes et les
              administrations en toute sécurité.
            </p>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-700/70 bg-slate-800/40 px-4 py-2 text-xs font-semibold text-slate-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Déclarations vérifiées par l'administration
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Liens Rapides</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#processus" onClick={(e) => handleNavClick(e, '#processus')} className="hover:text-brand-400 transition-colors cursor-pointer inline-flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-brand-500 group-hover:w-3 transition-all duration-300"></span>
                  Comment ça marche
                </a>
              </li>
              <li>
                <Link to="/recherche" className="hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-brand-500 group-hover:w-3 transition-all duration-300"></span>
                  Rechercher une CNI
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-brand-500 group-hover:w-3 transition-all duration-300"></span>
                  Espace Administration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Légal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-brand-500 group-hover:w-3 transition-all duration-300"></span>
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-brand-500 group-hover:w-3 transition-all duration-300"></span>
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-brand-500 group-hover:w-3 transition-all duration-300"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© 2026 CNIFinder. Tous droits réservés.</span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-500">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Plateforme sécurisée
          </span>
        </div>
      </div>
    </footer>
  );
};

export default FooterAccueil;
