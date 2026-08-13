import AnimateOnScroll from '../AnimateOnScroll';

const CircularProcess = () => {
  const steps = [
    { num: '01', title: 'Créer un compte', desc: 'Inscription sécurisée' },
    { num: '02', title: 'Signaler', desc: 'Déclarer la CNI trouvée' },
    { num: '03', title: 'Scanner', desc: 'Photo recto/verso' },
    { num: '04', title: 'Extraction', desc: 'Lecture OCR automatique' },
    { num: '05', title: 'Validation', desc: 'Vérification par un agent' },
    { num: '06', title: 'Recherche', desc: 'Le propriétaire cherche' },
    { num: '07', title: 'Vérification', desc: "Preuve d'identité" },
    { num: '08', title: 'Récupération', desc: 'Retrait en toute sécurité' },
  ];

  const positions = [
    "top-0 left-1/2 -translate-x-1/2",
    "top-[15%] right-[15%]",
    "top-1/2 right-0 -translate-y-1/2",
    "bottom-[15%] right-[15%]",
    "bottom-0 left-1/2 -translate-x-1/2",
    "bottom-[15%] left-[15%]",
    "top-1/2 left-0 -translate-y-1/2",
    "top-[15%] left-[15%]"
  ];

  return (
    <section id="processus" className="py-24 bg-white overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-6 text-center mb-14">
        <AnimateOnScroll animation="fade-down">
          <span className="text-brand-600 font-bold text-xs tracking-[0.2em] uppercase">Le parcours</span>
        </AnimateOnScroll>
        <AnimateOnScroll animation="fade-up" delay={100}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 mt-3 tracking-tight">Un processus cyclique et sécurisé</h2>
        </AnimateOnScroll>
        <AnimateOnScroll animation="fade-up" delay={200}>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Suivez le parcours de votre carte, de la découverte à la restitution, en toute transparence.
          </p>
        </AnimateOnScroll>
      </div>

      <div className="relative w-[320px] h-[320px] md:w-[620px] md:h-[620px] mx-auto">
        <div className="absolute inset-0 border-2 border-dashed border-brand-200 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-6 border border-brand-100 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.06),transparent_65%)] rounded-full"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-brand-600 to-brand-800 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-brand-600/30 z-10">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span className="font-bold text-sm md:text-base text-center leading-tight">CNI<br/>Sécurisée</span>
        </div>

        {steps.map((step, index) => (
          <div key={index} className={`absolute ${positions[index]} flex flex-col items-center text-center w-36 md:w-44 z-20 group`}>
            <AnimateOnScroll animation="zoom-in" delay={index * 100}>
              <div className="w-11 h-11 md:w-14 md:h-14 bg-white border-2 border-brand-500 rounded-full flex items-center justify-center font-extrabold text-brand-600 shadow-md shadow-brand-500/10 group-hover:bg-gradient-to-br group-hover:from-brand-500 group-hover:to-brand-700 group-hover:text-white group-hover:shadow-brand-500/30 group-hover:-translate-y-1 transition-all duration-300 mb-2.5">
                {step.num}
              </div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{step.title}</h4>
              <p className="text-xs text-slate-500 mt-1 hidden md:block">{step.desc}</p>
            </AnimateOnScroll>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-slate-400 mt-14 md:mt-24">
        * Sur mobile, le processus s'adapte en une liste verticale pour une meilleure lisibilité.
      </p>
    </section>
  );
};

export default CircularProcess;
