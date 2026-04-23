# Agileo 🚀

Agileo est une plateforme de gestion de projet agile (Scrum) conçue spécifiquement pour les étudiants et les petites équipes. Elle permet de planifier, suivre et livrer des projets avec une interface intuitive et moderne.

## 🎯 Cas d'Utilisation

Ce projet a été développé pour simplifier l'adoption des méthodologies Agiles dans un contexte académique. Il permet de transformer des User Stories en tâches concrètes et de visualiser l'avancement du groupe en temps réel.

## ✨ Fonctionnalités Clés

- **Tableau de Bord Global** : Vue d'ensemble des statistiques de productivité avec des graphiques interactifs (via Recharts).
- **Gestion de Projet** : Création, personnalisation (couleurs, descriptions) et suppression complète de projets.
- **Kanban Interactif** : Suivi des tâches par Drag & Drop avec @dnd-kit et persistance en base de données.
- **Gestion d'Équipe** : Invitation de membres par email et gestion des accès sécurisée.
- **Authentification** : Système de connexion et d'inscription sécurisé géré par Supabase Auth.
- **Design Premium** : Interface moderne, responsive et fluide utilisant Tailwind CSS et les composants Shadcn UI.

## 🛠️ Stack Technique

- **Frontend** : React 18, TypeScript, Vite (pour une expérience de développement ultra-rapide).
- **Styling** : Tailwind CSS, Shadcn UI (Radix UI), Lucide React pour les icônes.
- **Backend & Database** : Supabase (PostgreSQL, Auth, Real-time sync).
- **Gestion d'État & Hooks** : React Hooks personnalisés pour une logique métier claire.
- **Drag & Drop** : @dnd-kit pour une manipulation fluide des tâches.
- **Déploiement** : Optimisé pour Vercel.

## 🚀 Installation Locale

1. **Cloner le projet**

   ```bash
   git clone https://github.com/Dhia-zorai/Agileo-main.git
   cd Agileo
   ```

2. **Lancer l'application** (nécessite Node.js)
   ```bash
   npm install
   npm run dev
   ```
   _Le site sera disponible sur `http://localhost:8080`._

---

_Projet réalisé dans le cadre des études GLSI2 en collaboration avec  [**@Tsem74**](https://github.com/Tsem74)- PFA._
