// Données d'exemple (version 0) — FICTIVES, à remplacer par le vrai catalogue (Firestore).

import { tsaGames, type Game } from "./tsa-games";

export type Audience = "teacher" | "parent";

export type School = {
  id: string;
  name: string;
};

export type AccessCode = {
  code: string;
  schoolId: string;
  audience: Audience;
};

export type Accommodation = {
  title: string;
  detail: string;
};

export type Difficulty = {
  title: string;
  detail: string;
};

export type Disorder = {
  slug: string;
  name: string;
  summary: string;
  difficulties: Difficulty[];
  // Jeux communs aux institutrices et aux parents.
  games?: Game[];
  teacher: Accommodation[];
  parent: Accommodation[];
};

export const schools: School[] = [
  { id: "ecole-soleil", name: "École du Soleil (fictive)" },
  { id: "ecole-tilleuls", name: "École des Tilleuls (fictive)" },
];

export const accessCodes: AccessCode[] = [
  { code: "SOLEIL-INST", schoolId: "ecole-soleil", audience: "teacher" },
  { code: "SOLEIL-PAR", schoolId: "ecole-soleil", audience: "parent" },
  { code: "TILLEULS-INST", schoolId: "ecole-tilleuls", audience: "teacher" },
  { code: "TILLEULS-PAR", schoolId: "ecole-tilleuls", audience: "parent" },
];

export const disorders: Disorder[] = [
  {
    slug: "dyslexie",
    name: "Dyslexie",
    summary: "Difficulté marquée dans l'apprentissage de la lecture et la reconnaissance des mots.",
    difficulties: [],
    teacher: [
      { title: "Police adaptée et agrandie", detail: "Documents en police sans empattement, taille 14 minimum, interligne 1,5." },
      { title: "Temps supplémentaire", detail: "Un tiers de temps en plus lors des évaluations écrites." },
      { title: "Consignes lues à voix haute", detail: "Lire ou faire lire les consignes avant chaque exercice." },
      { title: "Orthographe non pénalisée", detail: "Hors dictée, l'orthographe n'est pas sanctionnée dans les autres matières." },
    ],
    parent: [
      { title: "Lecture partagée", detail: "Lire à tour de rôle : une phrase l'enfant, une phrase l'adulte." },
      { title: "Livres audio", detail: "Alterner lecture et écoute pour garder le plaisir de l'histoire." },
      { title: "Devoirs fractionnés", detail: "Courtes séances de 10 à 15 minutes avec une pause entre chaque." },
    ],
  },
  {
    slug: "dysorthographie",
    name: "Dysorthographie",
    summary: "Difficulté persistante en orthographe et en expression écrite.",
    difficulties: [],
    teacher: [],
    parent: [],
  },
  {
    slug: "dyscalculie",
    name: "Dyscalculie",
    summary: "Difficulté à comprendre ou à manipuler les nombres et le raisonnement mathématique.",
    difficulties: [],
    teacher: [],
    parent: [],
  },
  {
    slug: "dyspraxie",
    name: "Dyspraxie",
    summary: "Trouble de la coordination et du geste (dysfonctionnement de la planification motrice).",
    difficulties: [],
    teacher: [
      { title: "Limiter la copie", detail: "Fournir les leçons photocopiées ou en version numérique." },
      { title: "Outils adaptés", detail: "Règle antidérapante, ciseaux à ressort, feuilles à grands interlignes." },
      { title: "Évaluer à l'oral", detail: "Permettre une réponse orale quand l'écrit n'est pas l'objet de l'évaluation." },
    ],
    parent: [
      { title: "Habillage simplifié", detail: "Vêtements à velcro ou élastiques plutôt que boutons et lacets." },
      { title: "Jeux de construction", detail: "Encourager les activités manuelles ludiques, sans pression." },
      { title: "Ordinateur pour l'écrit", detail: "Initier tôt au clavier pour les longs textes." },
    ],
  },
  {
    slug: "dysphasie",
    name: "Dysphasie",
    summary: "Trouble de l'expression et de la compréhension du langage oral.",
    difficulties: [],
    teacher: [],
    parent: [],
  },
  {
    slug: "dysgraphie",
    name: "Dysgraphie",
    summary: "Difficulté touchant le geste d'écriture et la qualité du tracé.",
    difficulties: [],
    teacher: [],
    parent: [],
  },
  {
    slug: "tdah",
    name: "TDA/H",
    summary: "Trouble du déficit de l'attention avec ou sans hyperactivité.",
    difficulties: [],
    teacher: [
      { title: "Place stratégique", detail: "Près de l'enseignante, loin des fenêtres et de la porte." },
      { title: "Consignes découpées", detail: "Une consigne à la fois, écrite au tableau en plus de l'oral." },
      { title: "Pauses de mouvement", detail: "Autoriser une courte mission (distribuer les feuilles, effacer le tableau)." },
      { title: "Minuteur visuel", detail: "Rendre le temps restant visible pendant les tâches." },
    ],
    parent: [
      { title: "Routine affichée", detail: "Un tableau illustré des étapes du matin et du soir." },
      { title: "Espace de travail épuré", detail: "Bureau dégagé, sans écran ni jouet à portée de main." },
      { title: "Valoriser l'effort", detail: "Féliciter la persévérance plutôt que le résultat." },
    ],
  },
  {
    slug: "tsa",
    name: "TSA",
    summary: "Trouble du spectre de l'autisme.",
    difficulties: [
      { title: "Communication et interactions sociales", detail: "Difficultés à échanger, à comprendre les émotions ou à utiliser le langage non verbal." },
      { title: "Comportements et intérêts", detail: "Présence d'intérêts restreints, de routines rigides ou de mouvements répétitifs (stéréotypies)." },
      { title: "Particularités sensorielles", detail: "Hypersensibilité ou hyposensibilité aux bruits, aux lumières ou au contact physique." },
    ],
    games: tsaGames,
    teacher: [],
    parent: [],
  },
];

export function findCode(input: string): AccessCode | undefined {
  const normalized = input.trim().toUpperCase();
  return accessCodes.find((c) => c.code === normalized);
}

export function findSchool(id: string): School | undefined {
  return schools.find((s) => s.id === id);
}

export function findDisorder(slug: string): Disorder | undefined {
  return disorders.find((d) => d.slug === slug);
}
