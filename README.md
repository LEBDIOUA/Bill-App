# Bill App

================ Installation et Configuration ====================

## l'architecture :
Ce projet, appelé frontend, est associé à un service API backend que vous devez également exécuter en local.
Vous trouverez donc deux dossiers : Billed-app-FR-Back et Billed-app-FR-Front..

bill-app/
   - Billed-app-FR-Back
   - Billed-app-FR-Front

## Cloner le projet:
```
git clone https://github.com/LEBDIOUA/Bill-App.git
```

## Comment lancer l'application en local ?
### étape 1 - Lancer le backend :
Suivez les indications dans le README du dossier Billed-app-FR-Back.

### étape 2 - Lancer le Frontend :
Suivez les indications dans le README du dossier Billed-app-FR-Front.

## Lancement de tous les tests en local avec Jest
```
$ npm run test
```

## Lancement d'un seul test
Installez jest-cli :
```
$npm i -g jest-cli
$jest src/__tests__/your_test_file.js
```

## Consultation de la couverture du test
Veuillez visiter le lien suivant: `http://127.0.0.1:8080/coverage/lcov-report/`

## Comptes et utilisateurs :
Vous pouvez vous connecter en utilisant les comptes suivants:

### administrateur : 
```
utilisateur : admin@test.tld 
mot de passe : admin
```
### employé :
```
utilisateur : employee@test.tld
mot de passe : employee
```

================ Description  ====================

## Description :
Ce projet est développé par Billed, une entreprise spécialisée dans la production de solutions SaaS destinées aux équipes de ressources humaines.
Il s'agit d'un site web permettant de gérer les notes de frais. Les utilisateurs de ce système sont les employés et les administrateurs RH, qui interagissent directement avec celui-ci. 
Les employés peuvent ajouter leurs notes de frais, tandis que les administrateurs peuvent les accepter ou les refuser.

## Fonctionnalité:


## Problématique

Pour le back-end, qui nous offre un service API, les deux parcours est prêt en version alpha. 
En ce qui concerne le côté front-end, le parcours administrateur a été testé et nécessite désormais des corrections de bogues, tandis que le parcours employé doit être entièrement testé et débogué.

## À réaliser
    ° Fixer les bugs identifiés dans le rapport de bug fourni par Jest.
    ° Fixer les bugs identifiés sur le parcours employé.
    ° Ajouter des tests unitaires et d’intégration pour les fichiers Bills et NewBill

## Les outils utilisés

## Bug report - bills

J'ai constaté que le test d'affichage des notes de frais par ordre décroissant est actuellement en échec (indiqué en rouge).
Cela signifie que les notes ne sont pas affichées dans l'ordre décroissant des dates. Pour résoudre ce problème, je devais corriger la fonctionnalité afin de faire passer le test en réussite (passer au vert).

### Solution

Afin de résoudre ce problème, j'ai ajouté une fonction de tri pour organiser les dates dans un ordre décroissant.
Cependant, cette approche rencontre des difficultés en raison de l'écriture des mois en français, ce qui empêche la fonction de tri de fonctionner correctement.
Pour remédier à cela, j'ai développé deux fonctions supplémentaires : l'une traduit les noms des mois en français vers l'anglais pour permettre le tri, tandis que l'autre reconvertit les noms des mois en français pour les afficher correctement à l'utilisateur.

## Bug report - Login

Dans le rapport de test "Login, si un administrateur remplit correctement les champs du Login, il devrait naviguer sur la page Dashboard", mais le test est passé au rouge.

### Solution

Si nous examinons attentivement cette partie du code, nous constatons que dans l'attribut 'email' de la variable objet 'user', nous stockons la valeur de l'input avec l'attribut data-testid= « employee-email-input », et la même chose est faite pour le mot de passe. 
Cependant, nous avons besoin des données saisies par l'administrateur. 
Par conséquent, j'ai simplement remplacé les valeurs des deux inputs récupérés par celles de l'administrateur.

## Bug hunt - bills

Le problème survient lorsque qu'un utilisateur de type « Employé » ajoute une nouvelle note de frais avec un justificatif dont l'extension n'est pas jpg, jpeg ou png. Dans ce cas, le modal ne présente pas le justificatif.
De plus, même pour un administrateur, il est impossible de visualiser le justificatif dans ces circonstances.
Dans le parcours administrateur, lors de la visualisation de la liste des notes de frais, le nom du fichier n'apparaît pas dans la colonne du justificatif.

### Solution

Pour résoudre le premier problème, j'ai ajouté la ligne de code suivante afin d'empêcher l'utilisateur de charger un format de fichier autre que jpg, jpeg ou png.
Quant au deuxième problème, au lieu d'envoyer uniquement le lien du fichier à "Actions", j'envoie également le nom du fichier en paramètre.
Ainsi, grâce aux petites modifications apportées dans la classe Action.js, nous pouvons maintenant l'afficher correctement.

## Bug hunt - Dashboard

Dans cette section du code, nous tentons de nous connecter en tant qu'administrateur.
Lorsque nous déplions une liste de tickets (par exemple : ceux avec le statut "validé") et sélectionnons un ticket, puis déplions une seconde liste (par exemple : ceux avec le statut "refusé"), nous rencontrons un problème : il devient impossible de sélectionner un ticket de la première liste.
Ce comportement inattendu nécessite une correction.

### Solution

Le problème provient des paramètres passés lors de l'appel de la méthode handleShowTickets. 
Actuellement, nous passons la liste complète des notes, alors que chaque groupe nécessite une liste spécifique : notes en attente, notes acceptées ou notes refusées
Ainsi, avant d'appeler la méthode, je crée trois listes distinctes et je les passe en paramètres en fonction de l'index de chaque groupe.

## Test Unitaire - Test d’intégration
Afin de garantir l'amélioration de la qualité, de la fiabilité et de la maintenabilité du logiciel, tout en assurant qualité lors des développements et des déploiements, j'ai rajouté de tests unitaires et d'intégration.

## Le rapport de tests

Dans le rapport de tests, tous les fichiers sont marqués en vert, ce qui indique que la majorité des unités et des composants ont été testés avec succès. 
Cela suggère une bonne couverture de test.

## Le repport de couverture

Comme le confirme le rapport de couverture, le taux de couverture est supérieur à 80% dans la colonne "statements", ce qui est essentiel pour garantir la qualité et la fiabilité du logiciel.


## Plan E2E
J'ai élaboré un plan E2E pour le parcours employé en raison de son importance capitale dans le processus de développement de l'application, de sa conception jusqu'à sa mise en production.
En simulant le comportement réel de l'utilisateur, ce type de test permet de garantir une expérience utilisateur fluide et sans accroc.
Le plan E2E identifie les éventuels problèmes ou dysfonctionnements, offrant ainsi la possibilité de les corriger dès les premières phases du développement.
Cela permet non seulement d'assurer la qualité et la fiabilité de l'application, mais également de renforcer la confiance des utilisateurs finaux en offrant une expérience utilisateur optimale.

