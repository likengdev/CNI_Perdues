import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/hero/Hero';
import SearchBar from '../components/search/SearchBar';
import CircularProcess from '../components/process/CircularProcess';
import Features from '../components/features/Features';

function Accueil() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <SearchBar />
        <CircularProcess />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

export default Accueil;