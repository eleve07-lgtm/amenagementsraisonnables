// Jeux sensori-moteurs d'occupation — source : « Fiche de jeux pour enfant TSA à domicile » (PDF).
// Titres ajoutés pour l'affichage ; texte d'origine conservé, coquilles corrigées.

export type Game = {
  title: string;
  place?: string;
  materials: string[];
  steps: string[];
  ordered?: boolean;
  tips?: string[];
};

export const tsaGames: Game[] = [
  {
    title: "Jeux d'eau",
    materials: [
      "Arrosoir, bouteille, petite casserole en plastique",
      "De l'eau à bonne température",
      "Tous les contenants qui peuvent faire varier le débit de l'eau et sa texture",
    ],
    steps: [
      "Installez l'enfant dans la salle de bain ou tout endroit qui peut être mouillé.",
      "Asseyez-le et utilisez les différents contenants pour glisser l'eau sur le corps. Racontez-lui ce que vous lui faites, là où vous l'arrosez : « Hou ! Là, là ! Ça mouille, c'est chaud, c'est froid ! Ça chatouille ! » Chantez-lui une chanson.",
    ],
  },
  {
    title: "Éveil des sens au repas",
    materials: ["Un plat ou quelques aliments dans un récipient"],
    steps: [
      "Mise en éveil des sens lors du repas : autorisez l'enfant à manipuler les morceaux et à les écraser sur la table.",
      "En l'encourageant, il portera de lui-même les aliments à sa bouche et prendra plaisir à manger tout seul.",
      "Ne pas mettre d'écran pendant le repas.",
    ],
  },
  {
    title: "Boîtes à remplir et à vider",
    materials: [
      "Des boîtes à chaussures en carton",
      "Des boîtes en plastique de tailles diverses, avec couvercles",
      "Des petits objets qui ne cassent pas, pour remplir 1 à 2 boîtes (jouets de l'enfant ou objets du quotidien : pinces à linge, foulards, chaussettes…)",
    ],
    steps: [
      "Remplissez 2 boîtes et présentez-les à l'enfant, avec aussi les boîtes vides.",
      "Installez-vous sur le tapis du salon ou dans la chambre.",
      "Videz le contenu avec l'enfant sur le sol, remplissez les boîtes et recommencez.",
      "Recommencez encore et encore, dans d'autres lieux de la maison.",
    ],
  },
  {
    title: "Chaussettes surprises",
    materials: [
      "3 ou 4 petites chaussettes célibataires ou abîmées, de tailles et de couleurs différentes",
      "Des petits objets (papier qui fait du bruit, balles en mousse, petits objets pouvant aller dans le bain…)",
    ],
    steps: [
      "Glissez de petits objets dans les chaussettes, comme de petites surprises.",
      "Elles peuvent être emportées n'importe où.",
    ],
    tips: [
      "Toujours rester présent(e) : ce jeu se présente à la maison ou ailleurs, mais toujours sous le regard de l'adulte.",
    ],
  },
  {
    title: "La boîte à papiers",
    materials: [
      "Des papiers récupérés et sans valeur (prospectus, courrier, enveloppes, vieux magazines…)",
      "Une boîte (à chaussures, par exemple)",
    ],
    steps: [
      "Rassemblez des papiers de tailles et de textures différentes dans un contenant : ce sera « la boîte à papiers ».",
      "Amusez-vous ensemble à expérimenter tout ce qu'on peut faire avec du papier.",
    ],
  },
  {
    title: "La cabane refuge",
    materials: [
      "Anciens rideaux, serviettes de bain, draps, tissus",
      "Pinces à linge, cordes à linge ou ficelles",
    ],
    steps: [
      "Dans le salon, la chambre ou le jardin : une chaise, deux chaises, un fauteuil, la table… Tout peut être prétexte à faire une cabane !",
      "Ce lieu peut devenir son lieu de refuge.",
    ],
  },
  {
    title: "Bulles de savon",
    materials: ["Deux flacons de bulles de savon"],
    steps: [
      "Faites des bulles pour jouer avec l'enfant et encouragez-le à faire la même chose.",
      "Ou montrez-lui comment éclater les bulles.",
    ],
  },
  {
    title: "Textures au goûter",
    materials: [
      "Des petits objets autorisés à être mis en bouche",
      "Des aliments de textures, couleurs et goûts différents, faciles à laver (confiture, miel, compote…)",
      "Un gant de toilette",
    ],
    steps: [
      "Regroupez les objets dans un petit sac.",
      "À l'heure du goûter, déposez une petite quantité d'un nouvel aliment sur l'un des petits jouets, quand la texture s'y prête.",
      "Vous pouvez aussi vous amuser à remplir de petits bols d'aliments de textures différentes.",
    ],
  },
  {
    title: "Pâte à sel",
    materials: [
      "Un verre de sel fin",
      "Un verre d'eau tiède",
      "Deux verres de farine",
      "Des colorants alimentaires ou des craies…",
    ],
    ordered: true,
    steps: [
      "Mélangez 2 verres de farine et 1 verre de sel fin dans un saladier.",
      "Versez 1 verre d'eau tiède.",
      "Malaxez jusqu'à obtenir une belle boule de pâte souple.",
    ],
    tips: [
      "Pâte trop friable : rajoutez de l'eau. Trop molle ou collante : ajoutez de la farine.",
      "Prolongements : découper du papier de diverses épaisseurs ; manipuler la pâte avec des ustensiles.",
    ],
  },
  {
    title: "Pâte à modeler maison",
    materials: [
      "1 tasse de sel",
      "2 tasses de farine",
      "1 tasse d'eau",
      "3 cuillères à soupe d'huile végétale (ou de glycérine)",
      "Du colorant alimentaire",
    ],
    ordered: true,
    steps: [
      "Mettez le sel et la farine dans un bol.",
      "Ajoutez l'eau et l'huile en remuant constamment, pour obtenir une pâte homogène et lisse.",
      "Divisez la pâte en portions.",
      "Ajoutez quelques gouttes de colorant à chaque portion et pétrissez bien.",
      "Conservez la pâte dans un plat ou un sac hermétique.",
    ],
    tips: [
      "Les quantités peuvent devoir être ajustées selon la marque ou l'âge des produits.",
      "Variante : ajoutez le colorant à l'eau avant de la mélanger aux ingrédients secs, pour une couleur plus uniforme.",
    ],
  },
  {
    title: "Bac sensoriel",
    place: "Dans le salon",
    materials: ["Du riz, des lentilles", "Des animaux en plastique", "Des contenants de récupération"],
    steps: ["Réalisez une boîte pour jouer avec le riz, les lentilles, les animaux et les contenants."],
  },
  {
    title: "Rideau de tissus",
    place: "Dans le jardin ou dans le salon",
    materials: ["Des morceaux de tissu", "Un cerceau", "Des perles ou autres objets pour faire du bruit (facultatif)"],
    steps: ["Créez un rideau en suspendant les morceaux de tissu au cerceau ; des perles peuvent y ajouter du bruit."],
  },
  {
    title: "Jeu d'association",
    materials: ["Un bout de carton", "Des perles de couleur", "Un gant en plastique"],
    steps: ["Associer les perles de couleur aux doigts du gant fixé sur le carton."],
  },
  {
    title: "Jeu de balle",
    materials: ["Des cerceaux", "Du collant (film adhésif transparent)", "Des balles"],
    steps: ["Fixez les cerceaux au mur et tendez-y le film adhésif, face collante vers l'extérieur : l'enfant lance les balles, qui restent collées."],
  },
];
