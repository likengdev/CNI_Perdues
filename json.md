# Développement du module Administration (Backend uniquement)

Tu es un architecte logiciel senior spécialisé en Django, Django REST Framework, PostgreSQL et conception d'API REST.

Je développe une plateforme web de restitution des Cartes Nationales d'Identité (CNI). Je souhaite commencer par développer entièrement le backend avant de créer le frontend.

Ta mission est donc de concevoir **uniquement le backend du module Administration**. Ne génère aucun composant Angular, aucune interface graphique et aucun code frontend. Toute ton attention doit être portée sur l'architecture backend, la logique métier et les API.

---

# Contexte du projet

La plateforme comporte trois acteurs :

* Déclarant : personne ayant retrouvé une CNI.
* Bénéficiaire : personne recherchant sa CNI.
* Administrateur : responsable de la supervision de la plateforme.

Le déclarant et le bénéficiaire ne disposent ni d'un tableau de bord ni d'un espace personnel.

Le seul utilisateur authentifié est l'administrateur.

Toute la gestion de la plateforme est centralisée dans son espace d'administration.

---

# Objectif

Développer un backend robuste, modulaire, sécurisé et facilement maintenable pour le module Administration.

Le code doit respecter les bonnes pratiques Django :

* séparation claire des responsabilités ;
* architecture modulaire ;
* logique métier placée dans des services lorsque cela est pertinent ;
* serializers DRF ;
* ViewSets ou APIView selon le besoin ;
* permissions adaptées ;
* validation des données ;
* gestion correcte des erreurs ;
* code facilement évolutif.

---

# Authentification

L'administrateur est le seul utilisateur possédant une authentification classique.

Mettre en place :

* connexion par email et mot de passe ;
* authentification JWT ;
* permissions réservées aux administrateurs ;
* déconnexion ;
* récupération des informations de l'administrateur connecté.

Toutes les API d'administration doivent être protégées.

---

# Dashboard

Créer une API permettant de récupérer toutes les statistiques nécessaires au tableau de bord.

Cette API doit retourner notamment :

* nombre total d'utilisateurs ;
* nombre de déclarants ;
* nombre de bénéficiaires ;
* annonces en attente ;
* annonces publiées ;
* annonces rejetées ;
* restitutions en cours ;
* CNI restituées ;
* recherches infructueuses ;
* dernières inscriptions ;
* dernières annonces ;
* dernières restitutions ;
* dernières activités.

L'objectif est qu'une seule requête fournisse toutes les informations nécessaires au Dashboard.

---

# Gestion des utilisateurs

Créer les endpoints permettant de :

* récupérer tous les utilisateurs ;
* rechercher un utilisateur ;
* filtrer les utilisateurs ;
* consulter un utilisateur ;
* suspendre un compte ;
* réactiver un compte.

Prévoir également :

* pagination ;
* tri ;
* filtres.

---

# Gestion des déclarants

Créer des endpoints permettant :

* d'obtenir tous les déclarants ;
* d'obtenir leurs annonces ;
* d'obtenir leurs statistiques de publication.

---

# Gestion des bénéficiaires

Créer des endpoints permettant :

* de récupérer tous les bénéficiaires ;
* de consulter leurs recherches ;
* de consulter les demandes de restitution.

---

# Gestion des annonces

Créer les endpoints permettant :

* récupérer toutes les annonces ;
* récupérer uniquement les annonces en attente ;
* récupérer uniquement les annonces publiées ;
* consulter une annonce ;
* valider une annonce ;
* rejeter une annonce avec un motif obligatoire ;
* supprimer une annonce frauduleuse.

Lors de la validation :

le statut devient :

PUBLIEE

Lors du rejet :

le statut devient :

REJETEE

Le motif du rejet doit être enregistré.

---

# Gestion des restitutions

Nouvelle logique métier :

Lorsqu'un bénéficiaire clique sur « Oui, c'est moi » :

* une mise en relation est créée ;
* l'annonce passe automatiquement au statut EN COURS DE RESTITUTION.

Le déclarant n'effectue ensuite plus aucune action.

Après la rencontre :

le bénéficiaire est le seul autorisé à confirmer avoir récupéré sa CNI.

Cette confirmation modifie l'état de la mise en relation et place l'annonce en attente de validation finale par l'administrateur.

Créer les endpoints permettant à l'administrateur de :

* consulter les restitutions en cours ;
* consulter les confirmations des bénéficiaires ;
* valider définitivement une restitution ;
* clôturer une restitution ;
* archiver l'annonce ;
* débloquer une restitution si nécessaire.

Prévoir également la gestion automatique du délai de 72 heures afin qu'une restitution non finalisée puisse redevenir disponible conformément aux règles métier.

---

# Statistiques

Créer un service chargé de calculer automatiquement les statistiques.

Prévoir des endpoints retournant notamment :

* nombre d'inscriptions ;
* nombre d'annonces ;
* annonces validées ;
* annonces rejetées ;
* restitutions terminées ;
* recherches effectuées ;
* taux de restitution.

Toutes les statistiques devront être calculées automatiquement à partir de la base de données.

---

# Historique

Créer un système d'historisation.

Chaque action importante devra être enregistrée automatiquement :

* inscription ;
* publication ;
* validation ;
* rejet ;
* suspension ;
* réactivation ;
* recherche ;
* mise en relation ;
* confirmation du bénéficiaire ;
* clôture d'une restitution.

Créer les endpoints permettant :

* consulter l'historique ;
* filtrer ;
* rechercher ;
* trier par date.

---

# Architecture attendue

Le développement doit inclure :

* modèles Django si des adaptations sont nécessaires ;
* serializers ;
* services métier ;
* permissions personnalisées ;
* ViewSets ou APIViews ;
* routes DRF ;
* validations ;
* gestion des exceptions ;
* pagination ;
* filtres ;
* recherches ;
* documentation claire du code.

Respecter une architecture propre facilitant la maintenance et les évolutions futures.

---

# Contraintes importantes

Ne développer **aucune interface frontend**.

Ne produire **que le backend**.

Supprimer toute référence aux fonctionnalités suivantes qui n'existent plus :

* Mobile Money ;
* paiement ;
* geste financier ;
* transactions ;
* statistiques financières.

Respecter strictement la logique métier suivante :

* le déclarant publie uniquement la CNI ;
* le bénéficiaire est le seul à confirmer avoir récupéré sa CNI ;
* l'administrateur valide la restitution, clôture le processus et archive définitivement l'annonce.

Le code généré doit être directement intégrable dans un projet Django REST Framework existant et respecter les bonnes pratiques de développement professionnel (Clean Architecture, séparation de la logique métier, modularité, évolutivité et sécurité).
