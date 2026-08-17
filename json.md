PROMPT POUR OPENCODE — Module Recherche CNI (IDFinder / CNIFinder)

CONTEXTE DU PROJET
Tu continues le développement du frontend React (Vite + Tailwind CSS v3.4.1, PAS la v4) d'une plateforme de restitution de CNI perdues au Cameroun. Le projet existe déjà et fonctionne. N'écrase rien de l'existant, adapte-toi à l'architecture en place. Le backend est Django REST Framework, déjà entièrement construit et fonctionnel pour ce module.

CE QUI EXISTE DÉJÀ DANS LE PROJET (NE PAS RECRÉER, NE PAS ÉCRASER)
- Landing page complète : src/pages/Accueil.jsx
- Page de choix : src/pages/ChoixEspace.jsx, avec 3 cartes cliquables (Rechercher une CNI -> doit mener à /recherche, Publier une CNI -> /publication, Espace Administrateur -> /admin/connexion)
- Parcours de publication complet et fonctionnel : src/pages/Publication.jsx (formulaire d'inscription par défaut avec lien "Déjà inscrit ? Confirmer mon numéro", capture recto/verso, extraction OCR, formulaire modifiable, choix de la position de la CNI, résumé, publication) et src/pages/ConfirmationPublication.jsx
- Espace administrateur complet : connexion JWT (src/pages/admin/ConnexionAdmin.jsx), sidebar (src/components/admin/BarreLaterale.jsx), tableau de bord avec statistiques réelles et graphique des restitutions mensuelles via recharts (src/pages/admin/TableauDeBord.jsx), listes utilisateurs/déclarants/bénéficiaires, validation/rejet d'annonces, clôture de restitutions, historique
- Palette Tailwind définie dans tailwind.config.js : couleurs brand-* (bleu institutionnel, de 50 à 900, utilisé pour toute l'app publique), marine-* (bleu marine foncé, réservé à l'espace admin), success (vert, pour la validation)
- Classes CSS réutilisables déjà définies dans index.css : .btn-primary, .btn-outline, .text-gradient, plus des animations custom (float, pulse-ring, shimmer)
- Composants réutilisables : Header et Footer (src/components/layout/), AnimateOnScroll (src/components/AnimateOnScroll.jsx, wrapper d'animation au scroll basé sur Intersection Observer, types d'animation : fade-up, fade-down, fade-left, fade-right, zoom-in, rotate-in)
- Couche API déjà en place : src/api/client.js (instance axios + fonction extraireMessageErreur pour lire proprement les erreurs DRF), src/api/utilisateurs.js, src/api/annonces.js, src/api/administration.js, src/api/miseEnRelation.js (contient déjà cloturerMiseEnRelation, utilisé côté admin)
- Contexte src/contexte/ContexteAdmin.jsx pour l'espace admin uniquement (ne concerne pas ce module)

ENDPOINTS BACKEND DJANGO DÉJÀ CONSTRUITS ET FONCTIONNELS POUR CE MODULE (à utiliser tels quels, ne rien inventer d'autre)

POST /api/utilisateurs/verifier/
  Corps : { telephone }
  Réponse : { inscrit: bool, utilisateur?: {...} }

POST /api/utilisateurs/inscrire/beneficiaire/
  Corps : { telephone, nom, prenom }
  Important : PAS de ville ni de quartier pour un bénéficiaire, ces champs ne sont jamais demandés ni utilisés dans ce module.

GET /api/annonces/rechercher/?nom=X&prenom=Y&date_naissance=AAAA-MM-JJ
  Les trois paramètres sont optionnels indépendamment mais nom/prenom sont la base de la recherche.
  Réponse : liste de { id, nom_titulaire, prenom_titulaire, photo_titulaire, date_creation }
  IMPORTANT : ce sont des INFOS PARTIELLES UNIQUEMENT. Jamais de numéro de carte, jamais de date ou lieu de naissance, jamais de coordonnées du déclarant à ce stade de la recherche.

POST /api/mise_en_relation/declencher/
  Corps : { annonce_id, telephone_beneficiaire }
  Réponse (TOUT est renvoyé d'un coup, c'est la "page privée" du bénéficiaire) :
  {
    id, annonce_id, annonce_nom_titulaire, annonce_prenom_titulaire,
    annonce_date_naissance, annonce_lieu_naissance, annonce_numero_carte,
    annonce_photo_titulaire, declarant_nom, declarant_prenom, declarant_telephone,
    beneficiaire_nom, beneficiaire_prenom, beneficiaire_telephone,
    confirmation_beneficiaire, cloture_administrateur, date_expiration
  }

POST /api/mise_en_relation/<id>/confirmer/
  Aucun corps requis. SEUL LE BÉNÉFICIAIRE CONFIRME LA RESTITUTION. Il n'existe et ne doit jamais exister de confirmation côté déclarant dans ce système.

DÉCISIONS DE CONCEPTION DÉJÀ PRISES, À RESPECTER STRICTEMENT SANS EXCEPTION

1. Fonctionnalité "geste" (pourboire/remerciement financier) : VOLONTAIREMENT ABANDONNÉE. Ne crée aucun écran, aucun bouton, même désactivé, ne fais référence à aucun paiement ou montant nulle part dans ce module.

2. Notification WhatsApp automatique : VOLONTAIREMENT ABANDONNÉE côté envoi automatique. Ne crée aucune logique d'envoi automatique de message. Le lien wa.me est généré et envoyé manuellement par l'administrateur, en dehors de ce module, plus tard. N'affiche donc jamais un message du type "une notification WhatsApp a été envoyée automatiquement" car ce serait faux. La page privée du bénéficiaire doit seulement afficher clairement les coordonnées du déclarant (nom, prénom, téléphone), sans rien promettre de plus.

3. Confirmation de restitution : UNE SEULE confirmation, faite uniquement par le bénéficiaire. Ne jamais créer d'interface, de bouton ou de texte suggérant une confirmation du côté du déclarant.

4. Recherche strictement en deux temps : la liste de résultats de recherche n'affiche JAMAIS les détails complets de l'annonce (numéro de carte, date/lieu de naissance) ni les coordonnées du déclarant. Ces informations n'apparaissent qu'après l'appel à /mise_en_relation/declencher/, qui correspond au clic "Oui, c'est moi".

5. Aucun contenu inventé nulle part : pas de faux chiffres, pas de faux témoignages, pas de fausses citations, pas de fausses promesses de fonctionnalités qui n'existent pas (comme une alerte automatique par SMS ou email si aucun résultat n'est trouvé — si tu ajoutes une option de ce type, précise explicitement que c'est un enregistrement manuel consultable par l'équipe, jamais un envoi automatique).

6. Tout le texte visible dans l'interface doit être en français.

7. Design professionnel et cohérent, OBLIGATOIRE : réutilise fidèlement le système visuel déjà en place dans le reste de l'application (couleurs brand-*, coins arrondis généreux type rounded-2xl, ombres douces shadow-soft ou shadow-card selon le contexte, boutons .btn-primary et .btn-outline déjà stylés, cohérence typographique avec le reste du site). Utilise AnimateOnScroll pour les apparitions progressives comme c'est fait ailleurs dans l'app. Aucun composant de ce module ne doit visuellement détonner avec le reste du site. Le résultat doit avoir un niveau de finition et de sérieux comparable à ce qui a déjà été construit pour la Publication et l'espace Administrateur.

CLARIFICATION IMPORTANTE SUR "COMPLÉTER LE PROFIL" — NE S'APPLIQUE PAS À CE MODULE
Dans le parcours de Publication (module différent, déjà terminé), un déclarant doit obligatoirement avoir renseigné une ville et un quartier, avec une étape dédiée "compléter le profil" si un utilisateur déjà inscrit ne les a pas encore fournis, car cette information est nécessaire pour publier une annonce.
Dans le module Recherche que tu construis maintenant, cette contrainte NE S'APPLIQUE JAMAIS. Un bénéficiaire s'inscrit uniquement avec nom, prénom et téléphone, et peut lancer une recherche immédiatement après son inscription, sans jamais avoir à fournir de ville ni de quartier. Ne crée donc aucune étape de complétion de profil dans ce module, ce serait une erreur de conception qui bloquerait inutilement l'utilisateur. Si, par ailleurs, un utilisateur déjà inscrit comme déclarant (et qui possède donc une ville et un quartier en base) effectue une recherche, cela ne pose également aucun problème : ces champs existent simplement en base mais ne sont ni demandés ni utilisés côté recherche.

SCÉNARIO COMPLET ATTENDU, ÉTAPE PAR ÉTAPE

1. Depuis la page ChoixEspace, l'utilisateur clique sur la carte "Rechercher une CNI", il arrive sur /recherche.
2. Il voit d'abord un formulaire d'inscription (nom, prénom, téléphone), avec un petit lien en dessous "Déjà inscrit ? Confirmer mon numéro" qui bascule vers un écran ne demandant que le téléphone.
3. Le numéro de téléphone est validé selon le format camerounais : exactement 9 chiffres, commençant par 6.
4. Si l'inscription réussit, ou si la confirmation du numéro déjà inscrit réussit, l'utilisateur accède directement au formulaire de recherche : deux champs, Nom et Prénom.
5. L'utilisateur lance la recherche. Le système appelle l'endpoint de recherche et affiche les résultats sur /recherche/resultats sous forme de grille de cartes, chacune affichant uniquement la photo, le nom, le prénom et la date de publication.
6. Si la recherche renvoie plusieurs résultats correspondant au même nom et prénom (homonymie), un champ optionnel "date de naissance" apparaît pour permettre d'affiner la recherche.
7. Si aucun résultat n'est trouvé, un état vide professionnel et honnête s'affiche, sans promesse de notification automatique.
8. L'utilisateur clique sur "Voir détails" d'une carte, il arrive sur /annonce/:id, qui affiche les mêmes informations partielles déjà en mémoire (photo, nom, prénom, date de publication), sans appeler de nouvel endpoint de détail puisqu'il n'en existe pas.
9. Un bouton principal "Oui, c'est moi" est mis en avant. Une confirmation est demandée avant d'agir (par exemple une modale simple), puis l'endpoint de déclenchement de mise en relation est appelé avec l'identifiant de l'annonce et le téléphone du bénéficiaire déjà vérifié à l'étape 2, 3 ou 4.
10. L'utilisateur est redirigé vers /beneficiaire/:miseEnRelationId, sa page privée. Cette page affiche de façon claire et bien mise en valeur : tous les détails complets de l'annonce (pour qu'il puisse vérifier que c'est bien sa carte) et les coordonnées complètes du déclarant (nom, prénom, téléphone), dans une carte dédiée et visible.
11. Un texte explique simplement la suite : contacter le déclarant pour organiser la remise physique de la carte.
12. Un unique bouton d'action est disponible : "Je confirme avoir récupéré ma CNI", qui appelle l'endpoint de confirmation. Après succès, un état de confirmation clair s'affiche, sans redirection surprise vers une autre page.

FICHIERS À CRÉER OU COMPLÉTER, DANS CET ORDRE

1. Compléter src/api/miseEnRelation.js (sans supprimer l'existant comme cloturerMiseEnRelation) : ajouter declencherMiseEnRelation(annonceId, telephoneBeneficiaire) qui appelle POST /mise_en_relation/declencher/, et confirmerRestitution(id) qui appelle POST /mise_en_relation/<id>/confirmer/.

2. Compléter src/api/annonces.js : ajouter rechercherAnnonces(nom, prenom, dateNaissance) qui appelle GET /annonces/rechercher/ avec les paramètres fournis en query string.

3. Créer src/pages/Recherche.jsx : reprend le même schéma d'écran que Publication.jsx (formulaire d'inscription par défaut, lien "Déjà inscrit ?", validation téléphone camerounais), mais avec un formulaire d'inscription réduit à nom/prénom/téléphone uniquement, puis affiche le formulaire de recherche nom/prénom une fois le téléphone confirmé ou inscrit. Au clic sur "Rechercher", appelle l'API et transmet les résultats à la page suivante via l'état de navigation de react-router (useNavigate avec state).

4. Créer src/pages/ResultatsRecherche.jsx : grille de cartes réutilisant le style déjà présent ailleurs dans l'app (rounded-2xl, ombre douce, bordure fine), chaque carte affichant photo/nom/prénom/date de publication formatée en français avec un bouton "Voir détails", plus un état vide professionnel et honnête si aucun résultat, plus un bouton pour relancer une nouvelle recherche.

5. Créer src/pages/DetailAnnonce.jsx : affiche les infos partielles déjà transmises en mémoire, avec le bouton principal "Oui, c'est moi" qui demande confirmation puis déclenche la mise en relation et redirige vers la page privée avec l'identifiant retourné.

6. Créer src/pages/PageBeneficiaire.jsx : affiche toutes les données retournées par l'endpoint de déclenchement (détails complets de l'annonce et coordonnées complètes du déclarant dans une carte bien visible), un texte explicatif sur la suite du processus, et un unique bouton "Je confirme avoir récupéré ma CNI" qui appelle l'endpoint de confirmation et affiche un état de succès clair après validation.

7. Mettre à jour src/App.jsx pour ajouter les routes suivantes : /recherche vers Recherche, /recherche/resultats vers ResultatsRecherche, /annonce/:id vers DetailAnnonce, /beneficiaire/:miseEnRelationId vers PageBeneficiaire. Vérifier également que le clic sur la carte "Rechercher une CNI" dans ChoixEspace.jsx redirige bien vers /recherche.

MÉTHODE DE TRAVAIL ATTENDUE
Construis une page à la fois, dans l'ordre indiqué ci-dessus, en réutilisant systématiquement les composants et styles déjà en place dans le projet plutôt que d'en recréer des différents. Teste que chaque page s'affiche correctement et s'intègre bien au routage avant de passer à la suivante. Ne modifie aucun fichier lié à la Publication ou à l'espace Administrateur sauf demande explicite. Si un comportement métier n'est pas totalement clair au vu des décisions de conception listées plus haut, pose la question avant d'inventer un comportement qui pourrait s'écarter du cahier des charges.