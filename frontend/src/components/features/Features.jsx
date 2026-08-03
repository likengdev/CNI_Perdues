import AnimateOnScroll from '../AnimateOnScroll';

const Features = () => {
  const features = [
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
      title: 'Comptes Utilisateurs Sécurisés',
      description: "Identification simple et sécurisée par numéro de téléphone, sans exposer vos données personnelles."
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>,
      title: 'Scan OCR Automatique',
      description: "Extraction automatique des informations de la CNI à partir de photos recto et verso."
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21L16.65 16.65" strokeLinecap="round"/></svg>,
      title: 'Recherche Rapide',
      description: "Retrouvez une annonce en quelques secondes par nom et prénom."
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      title: 'Validation Administrative',
      description: "Chaque annonce est vérifiée par un administrateur avant d'être publiée."
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/></svg>,
      title: 'Coordonnées Protégées',
      description: "Vos coordonnées ne sont jamais visibles publiquement avant confirmation."
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>,
      title: 'Suivi de Restitution',
      description: "Suivez chaque étape de la restitution, de la mise en relation à la clôture."
    }
  ];

  return (
    <section id="fonctionnalites" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <AnimateOnScroll animation="fade-down">
            <span className="text-brand-600 font-bold text-sm tracking-widest uppercase">FONCTIONNALITÉS</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={100}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 mt-3">Une plateforme pensée pour la confiance</h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={200}>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Chaque étape du parcours est conçue pour protéger les citoyens
              et garantir la fiabilité des informations échangées.
            </p>
          </AnimateOnScroll>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimateOnScroll key={index} animation="fade-up" delay={index * 100}>
              <div className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 border border-slate-100 group h-full">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;