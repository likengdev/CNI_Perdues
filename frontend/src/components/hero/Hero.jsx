import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../AnimateOnScroll';
import heroImage from '../../assets/hero.png';

const Hero = () => {
  const navigue = useNavigate();

  return (
    <section id="accueil" className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <AnimateOnScroll animation="fade-down" delay={100}>
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-brand-100">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              Portail Citoyen Sécurisé
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={200}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Retrouvez vos <span className="text-gradient">Cartes d'Identité</span> rapidement et en toute sécurité.
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={300}>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Une plateforme de confiance pour signaler, rechercher et
              récupérer les cartes nationales d'identité perdues, avec
              validation administrative et vérification sécurisée.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={400}>
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => navigue('/verification?intention=declarer')}
                className="btn-primary"
              >
                Signaler une CNI trouvée
              </button>
              <button
                onClick={() => navigue('/verification?intention=chercher')}
                className="btn-outline"
              >
                Rechercher ma CNI
              </button>
            </div>
          </AnimateOnScroll>
        </div>

        <AnimateOnScroll animation="zoom-in" delay={300}>
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500/10 rounded-3xl blur-3xl"></div>
            <img
              src="/cnilabb.jpg"
              alt="Carte d'identité sur un bureau"
              className="relative rounded-3xl shadow-2xl w-full object-cover h-[400px] lg:h-[500px] animate-float"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-card flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success relative">
                <div className="absolute inset-0 bg-success/20 rounded-full animate-pulse-ring"></div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800">Système Vérifié</p>
                <p className="text-xs text-slate-500">Conforme aux normes de protection des données.</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default Hero;