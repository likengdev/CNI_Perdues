import { Link, useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
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
    <footer className="bg-slate-900 text-slate-300 py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">CNI<span className="text-brand-500">Finder</span></span>
          </div>
          <p className="text-sm leading-relaxed max-w-sm mb-6">
            La plateforme de référence pour la récupération des documents
            d'identité perdus. Nous connectons les citoyens honnêtes et les
            administrations en toute sécurité.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Liens Rapides</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#processus" onClick={(e) => handleNavClick(e, '#processus')} className="hover:text-brand-400 transition-colors cursor-pointer">Comment ça marche</a></li>
            <li><Link to="/recherche" className="hover:text-brand-400 transition-colors">Rechercher une CNI</Link></li>
            <li><Link to="/admin/login" className="hover:text-brand-400 transition-colors">Espace Administration</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Légal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-brand-400 transition-colors">Politique de confidentialité</Link></li>
            <li><Link to="/" className="hover:text-brand-400 transition-colors">Conditions d'utilisation</Link></li>
            <li><Link to="/" className="hover:text-brand-400 transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 CNIFinder. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;