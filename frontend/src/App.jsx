import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil';
import ChoixEspace from './pages/ChoixEspace';
import Publication from './pages/Publication';
import ConfirmationPublication from './pages/ConfirmationPublication';
import Recherche from './pages/Recherche';
import ConnexionAdmin from './pages/admin/ConnexionAdmin';
import { FournisseurAdmin } from './contexte/ContexteAdmin';
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
        <Route path="/admin/login" element={<ConnexionAdmin/>} />
      </Routes>
       </BrowserRouter>
      </FournisseurAdmin>
   
  );
}

export default App;