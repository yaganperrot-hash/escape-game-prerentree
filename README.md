# ETNA Escape Game - Pre-rentree

Escape game d'integration pour les nouveaux etudiants de l'ETNA, joue le jour de la rentree.
Les equipes dejouent un hacking fictif en parcourant les services de l'ecole.

## Jouer

Point d'entree : **[intro.html](intro.html)** (ou la racine du site, qui y redirige).

Six services, six enigmes, six lettres a rassembler pour neutraliser l'attaque.
Comptez une heure : le jeu est chronometre.

## Technique

HTML / CSS / JavaScript vanilla, aucun framework, aucun backend.
Mobile-first : le jeu est concu pour etre lance depuis un QR code, donc sur telephone.

Aucune donnee joueur n'est collectee, stockee ni transmise. La progression vit
uniquement dans le `sessionStorage` du navigateur et disparait a la fermeture de l'onglet.

## Deploiement

Hebergement statique : deposer les fichiers a la racine du site, sans etape de build.
