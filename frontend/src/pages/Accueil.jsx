import HeaderAccueil from '../components/layout/HeaderAccueil';
import FooterAccueil from '../components/layout/FooterAccueil';
import Hero from '../components/hero/Hero';
import SearchBar from '../components/search/SearchBar';
import CircularProcess from '../components/process/CircularProcess';
import Features from '../components/features/Features';

function Accueil() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <HeaderAccueil />
      <main>
        <Hero />
        <SearchBar />
        <CircularProcess />
        <Features />
      </main>
      <FooterAccueil />
    </div>
  );
}

export default Accueil;