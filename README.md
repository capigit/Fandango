<div align="center">

# 🎬 Fandango — Analyse du Biais de Notation

> Une investigation data qui prouve que Fandango gonflait artificiellement ses notes de films.

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-e31837?style=flat-square&logo=github)](https://capigit.github.io/Fandango/)
[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

</div>

---

## 🔍 Contexte

En 2015, le journaliste **Walt Hickey** (FiveThirtyEight) a découvert que Fandango affichait des notes
de films systématiquement supérieures à leurs notes brutes réelles. La plateforme appliquait un arrondi
au **plafond** (ceiling) plutôt qu'un arrondi standard, transformant par exemple un 4.1 en 4.5 étoiles
affiché — incitant les spectateurs à acheter des billets pour des films en réalité moins bien notés.

Ce projet visualise et quantifie ce biais à partir du jeu de données original.

---

## 📊 Résultats Clés

| Métrique | Valeur |
|---|---|
| Films analysés | 505 |
| Films avec note gonflée | **75%** |
| Écart moyen (affiché − réel) | **+0.21 ★** |
| Écart maximum constaté | **+1.0 ★** |
| Moyenne affichée | 4.09 ★ |
| Moyenne réelle | 3.88 ★ |

---

## 🖥️ Démo Live

👉 **[https://capigit.github.io/Fandango/](https://capigit.github.io/Fandango/)**

---

## ✨ Fonctionnalités

- **Hero interactif** — Scatter plot en temps réel (note réelle vs affichée) directement dans la hero section
- **4 cartes de statistiques** — chiffres clés calculés dynamiquement depuis le CSV
- **3 visualisations Chart.js** :
  - Nuage de points (note affichée vs note réelle) avec diagonale d'équité
  - Histogramme de distribution des écarts
  - Comparaison des distributions STARS vs RATING
- **Tableau interactif** — recherche par titre, filtres par niveau d'écart, tri sur toutes les colonnes, pagination
- **Animations d'entrée** en cascade sur la hero
- **Design responsive** — adapté mobile, tablette et desktop
- **Déploiement zéro-dépendance** — fichiers statiques, aucun build nécessaire

---

## 🛠️ Stack Technique

| Technologie | Usage |
|---|---|
| HTML5 | Structure sémantique |
| CSS3 | Design, animations, responsive (Grid + Flexbox) |
| JavaScript ES2020 | Logique, parsing CSV, rendu dynamique |
| [Chart.js 4.4](https://www.chartjs.org/) | Visualisations (CDN) |
| GitHub Pages | Hébergement statique |

Aucun framework, aucun bundler, aucune dépendance npm.

---

## 📁 Structure du Projet

```
Fandango/
├── index.html           # Structure HTML de l'application
├── favicon.svg          # Icône de l'onglet
├── fandango_data.csv    # Données source (505 films)
├── css/
│   └── style.css        # Tous les styles (variables, composants, responsive)
└── js/
    └── main.js          # Logique complète (CSV, stats, charts, tableau)
```

---

## 🚀 Lancer en Local

Aucune installation requise. Cloner le repo et ouvrir avec un serveur local
(nécessaire pour le `fetch` du CSV) :

```bash
git clone git@github.com:capigit/Fandango.git
cd Fandango

# Option 1 — Python
python3 -m http.server 8080

# Option 2 — Node.js
npx serve .

# Option 3 — VS Code
# Installer l'extension "Live Server" puis clic droit → Open with Live Server
```

Ouvrir ensuite `http://localhost:8080` dans le navigateur.

> ⚠️ Ne pas ouvrir `index.html` directement via `file://` — le navigateur bloquera le `fetch` du CSV (CORS).

---

## 📦 Déploiement GitHub Pages

Le site est déployé automatiquement depuis la branche `main` :

1. Pousser sur `main`
2. GitHub Actions construit et publie automatiquement
3. URL disponible : `https://capigit.github.io/Fandango/`

Pour configurer manuellement :  
**Settings → Pages → Source : Deploy from a branch → main / (root) → Save**

---

## 📂 Données

Le fichier `fandango_data.csv` provient de l'investigation originale de
[Walt Hickey / FiveThirtyEight](https://fivethirtyeight.com/features/fandango-movies-ratings/) (2015).

| Colonne | Description |
|---|---|
| `FILM` | Titre du film (avec année) |
| `STARS` | Note **affichée** par Fandango (0–5, paliers de 0.5) |
| `RATING` | Note **brute** réelle enregistrée en base |
| `VOTES` | Nombre de votes utilisateurs |

---

## 📝 Licence

Ce projet est open source sous licence [MIT](https://opensource.org/licenses/MIT).  
Les données sont issues de FiveThirtyEight et utilisées à des fins éducatives.
