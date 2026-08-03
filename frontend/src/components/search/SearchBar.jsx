import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../AnimateOnScroll';

const SearchBar = () => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const navigue = useNavigate();

  const lancerRecherche = (e) => {
    e.preventDefault();
    navigue(`/verification?intention=chercher&nom=${nom}&prenom=${prenom}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 mb-20">
      <AnimateOnScroll animation="fade-up" delay={200}>
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-card border border-slate-100">
          <form onSubmit={lancerRecherche} className="grid md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="ex : Marcel"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="ex : Kamdem"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2 h-[50px]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21L16.65 16.65" strokeLinecap="round"/>
              </svg>
              Rechercher
            </button>
          </form>
        </div>
      </AnimateOnScroll>
    </div>
  );
};

export default SearchBar;