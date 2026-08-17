import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FournisseurAdmin } from './contexte/ContexteAdmin'
import Accueil from './pages/Accueil'
import ChoixEspace from './pages/ChoixEspace'
import Publication from './pages/Publication'
import ConfirmationPublication from './pages/ConfirmationPublication'
import Recherche from './pages/Recherche'
import ResultatsRecherche from './pages/ResultatsRecherche'
import DetailAnnonce from './pages/DetailAnnonce'
import PageBeneficiaire from './pages/PageBeneficiaire'
import ConnexionAdmin from './pages/admin/ConnexionAdmin'
import TableauDeBord from './pages/admin/TableauDeBord'
import ListeUtilisateurs from './pages/admin/ListeUtilisateurs'
import ListeDeclarants from './pages/admin/ListeDeclarants'
import ListeBeneficiaires from './pages/admin/ListeBeneficiaires'
import AnnoncesEnAttente from './pages/admin/AnnoncesEnAttente'
import AnnoncesPubliees from './pages/admin/AnnoncesPubliees'
import RestitutionsEnCours from './pages/admin/RestitutionsEnCours'
import RestitutionsTerminees from './pages/admin/RestitutionsTerminees'
import HistoriqueActivites from './pages/admin/HistoriqueActivites'
import RouteProtegeeAdmin from './routes/RouteProtegeeAdmin'

function App() {
  return (
    <FournisseurAdmin>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/choix-espace" element={<ChoixEspace />} />
          <Route path="/publication" element={<Publication />} />
          <Route path="/publication/confirmation" element={<ConfirmationPublication />} />
          <Route path="/recherche" element={<Recherche />} />
          <Route path="/recherche/resultats" element={<ResultatsRecherche />} />
          <Route path="/annonce/:id" element={<DetailAnnonce />} />
          <Route path="/beneficiaire/:miseEnRelationId" element={<PageBeneficiaire />} />
          <Route path="/admin/connexion" element={<ConnexionAdmin />} />

          <Route path="/admin" element={<RouteProtegeeAdmin><TableauDeBord /></RouteProtegeeAdmin>} />
          <Route path="/admin/utilisateurs" element={<RouteProtegeeAdmin><ListeUtilisateurs /></RouteProtegeeAdmin>} />
          <Route path="/admin/declarants" element={<RouteProtegeeAdmin><ListeDeclarants /></RouteProtegeeAdmin>} />
          <Route path="/admin/beneficiaires" element={<RouteProtegeeAdmin><ListeBeneficiaires /></RouteProtegeeAdmin>} />
          <Route path="/admin/annonces/en-attente" element={<RouteProtegeeAdmin><AnnoncesEnAttente /></RouteProtegeeAdmin>} />
          <Route path="/admin/annonces/publiees" element={<RouteProtegeeAdmin><AnnoncesPubliees /></RouteProtegeeAdmin>} />
          <Route path="/admin/restitutions/en-cours" element={<RouteProtegeeAdmin><RestitutionsEnCours /></RouteProtegeeAdmin>} />
          <Route path="/admin/restitutions/terminees" element={<RouteProtegeeAdmin><RestitutionsTerminees /></RouteProtegeeAdmin>} />
          <Route path="/admin/historique" element={<RouteProtegeeAdmin><HistoriqueActivites /></RouteProtegeeAdmin>} />
        </Routes>
      </BrowserRouter>
    </FournisseurAdmin>
  )
}

export default App