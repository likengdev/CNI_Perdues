import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

function Recherche() {
  const navigue = useNavigate()
  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <Header />
      <main className="flex-grow max-w-3xl w-full mx-auto px-6 pt-32 pb-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Recherche de CNI</h1>
        <p className="text-slate-500 mb-8">Ce module sera bientôt disponible.</p>
        <button type="button" onClick={() => navigue('/')} className="btn-primary">
          Retour à l&apos;accueil
        </button>
      </main>
      <Footer />
    </div>
  )
}

export default Recherche
