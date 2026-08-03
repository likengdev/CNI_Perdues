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
    <section id="processus" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <AnimateOnScroll animation="fade-down">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Un processus cyclique et sécurisé</h2>
        </AnimateOnScroll>
        <AnimateOnScroll animation="fade-up" delay={100}>
          <p className="text-slate-500 max-w-2xl mx-auto">Suivez le parcours de votre carte, de la découverte à la restitution, en toute transparence.</p>
        </AnimateOnScroll>
      </div>

      <div className="relative w-[320px] h-[320px] md:w-[600px] md:h-[600px] mx-auto">
        <div className="absolute inset-0 border-2 border-dashed border-brand-200 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-4 border border-brand-100 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }}></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-brand-600 to-brand-700 rounded-full flex flex-col items-center justify-center text-white shadow-xl z-10">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-1">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className="font-bold text-sm md:text-base text-center leading-tight">CNI<br/>Sécurisée</span>
        </div>

        {steps.map((step, index) => (
          <div key={index} className={`absolute ${positions[index]} flex flex-col items-center text-center w-32 md:w-40 z-20 group`}>
            <AnimateOnScroll animation="zoom-in" delay={index * 100}>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-brand-500 rounded-full flex items-center justify-center font-bold text-brand-600 shadow-md group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 mb-2">
                {step.num}
              </div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{step.title}</h4>
              <p className="text-xs text-slate-500 mt-1 hidden md:block">{step.desc}</p>
            </AnimateOnScroll>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-slate-400 mt-12 md:mt-20">
        * Sur mobile, le processus s'adapte en une liste verticale pour une meilleure lisibilité.
      </p>
    </section>
  );
};

export default CircularProcess;