import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../components/AnimateOnScroll';

const ChoixEspace = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col overflow-x-hidden relative selection:bg-brand-500 selection:text-white font-sans">
      {/* Bouton Retour à l'accueil */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 text-slate-600 hover:text-brand-600"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span className="font-semibold text-sm">Retour à l'accueil</span>
        </button>
      </div>

      {/* Arrière-plans lumineux (Premium Glow Effects) */}
      <div className="absolute top-[-10%] left-[10%] w-[800px] h-[600px] bg-brand-400/20 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[500px] bg-success/15 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-multiply"></div>
      
      <main className="flex-grow pt-24 pb-32 px-6 flex flex-col items-center justify-center relative z-10">
        <AnimateOnScroll animation="fade-down" className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/60 shadow-sm mb-8 hover:shadow-md transition-shadow">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-600 tracking-wide">Portail d'Accès Sécurisé</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
            Bienvenue sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400">IDFinder</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-light">
            Sélectionnez votre espace pour continuer. Une plateforme innovante et intuitive pour retrouver ou déclarer une Carte Nationale d'Identité.
          </p>
        </AnimateOnScroll>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
          
          {/* CARTE 1: Rechercher */}
          <AnimateOnScroll animation="fade-up" delay={100} className="h-full">
            <div 
              onClick={() => navigate('/recherche')}
              className="group cursor-pointer bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(14,165,233,0.15)] transition-all duration-500 hover:-translate-y-3 flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              
              <div className="w-20 h-20 rounded-[1.5rem] bg-brand-50 text-brand-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-brand-500/30">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-brand-700 transition-colors duration-300">Rechercher</h2>
              <p className="text-slate-500 flex-grow text-lg leading-relaxed mb-12 font-medium">
                Retrouvez votre CNI perdue parmi des centaines d'annonces vérifiées par notre équipe.
              </p>
              
              <div className="flex items-center text-brand-600 font-bold text-lg group-hover:translate-x-2 transition-transform duration-300 mt-auto">
                <span>Accéder à l'espace</span>
                <svg className="ml-2 w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </AnimateOnScroll>

          {/* CARTE 2: Publier */}
          <AnimateOnScroll animation="fade-up" delay={200} className="h-full">
            <div 
              onClick={() => navigate('/publication')}
              className="group cursor-pointer bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)] transition-all duration-500 hover:-translate-y-3 flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              
              <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-success group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-success/30">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">Publier</h2>
              <p className="text-slate-500 flex-grow text-lg leading-relaxed mb-12 font-medium">
                Vous avez trouvé une CNI ? Signalez-la rapidement pour aider son propriétaire à la récupérer.
              </p>
              
              <div className="flex items-center text-emerald-600 font-bold text-lg group-hover:translate-x-2 transition-transform duration-300 mt-auto">
                <span>Accéder à l'espace</span>
                <svg className="ml-2 w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </AnimateOnScroll>

          {/* CARTE 3: Administrateur */}
          <AnimateOnScroll animation="fade-up" delay={300} className="h-full">
            <div 
              onClick={() => navigate('/admin/connexion')}
              className="group cursor-pointer bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(15,23,42,0.15)] transition-all duration-500 hover:-translate-y-3 flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              
              <div className="w-20 h-20 rounded-[1.5rem] bg-slate-100 text-slate-700 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-slate-900/30">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M12 12h.01"></path>
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-slate-800 transition-colors duration-300">Administration</h2>
              <p className="text-slate-500 flex-grow text-lg leading-relaxed mb-12 font-medium">
                Espace hautement sécurisé réservé à l'équipe pour valider les annonces et administrer la plateforme.
              </p>
              
              <div className="flex items-center text-slate-800 font-bold text-lg group-hover:translate-x-2 transition-transform duration-300 mt-auto">
                <span>Accès sécurisé</span>
                <svg className="ml-2 w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </AnimateOnScroll>

        </div>
      </main>
    </div>
  );
};

export default ChoixEspace;
