import { Question, QuestionType } from './types';

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    type: QuestionType.TRUE_FALSE,
    text: "Le site français parodique Le Gorafi est né après un conflit d'intérêts avec les créateurs du Figaro en 1826.",
    correctAnswer: false,
    explanation: "Le célèbre site a été créé en 2012, mais affirme humoristiquement dans sa présentation être né de la tentative d'un journaliste dyslexique de créer son propre média.",
    storyContext: "Votre première mission : démêler l'histoire des médias parodiques.",
    difficulty: 'easy'
  },
  {
    id: 2,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Laquelle de ces affirmations est une fake news ?",
    choices: [
      { id: 'a', text: "Une Américaine est poursuivie pour avoir fait voter son chien aux élections.", isCorrect: false },
      { id: 'b', text: "Un pigeon américain a été euthanasié après avoir enfreint le confinement australien pendant l'épidémie de Covid-19.", isCorrect: true },
      { id: 'c', text: "La justice a ordonné au propriétaire d'un coq trop bruyant de s'en séparer.", isCorrect: false }
    ],
    explanation: "Le pigeon Joe, découvert en Australie en 2020 après un vol supposé depuis les États-Unis, s'est finalement révélé ne pas être américain et a ainsi échappé de justesse à l'euthanasie prévue.",
    storyContext: "Les animaux sont souvent au cœur de rumeurs insolites. Saurez-vous repérer l'intrus ?",
    difficulty: 'medium'
  },
  {
    id: 3,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "En quoi le livre antisémite « Les Protocoles des sages de Sion » constitue-t-il une fake news ?",
    choices: [
      { id: 'a', text: "Il a été inventé de toutes pièces.", isCorrect: true },
      { id: 'b', text: "Il a été complètement sorti de son contexte.", isCorrect: false },
      { id: 'c', text: "Il a été mal traduit.", isCorrect: false }
    ],
    explanation: "Paru au début du XXe siècle, ce livre se présente comme la retranscription de réunions secrètes de dirigeants juifs qui auraient conçu un plan pour dominer le monde. Il n'en est rien : ce faux document, devenu un symbole de l'antisémitisme, a été inventé de toutes pièces.",
    storyContext: "Certaines fake news ont des conséquences historiques dramatiques. Il est crucial de comprendre leur origine.",
    difficulty: 'hard'
  },
  {
    id: 4,
    type: QuestionType.TRUE_FALSE,
    text: "Aux États-Unis, la lecture à la radio du roman « La Guerre des mondes », racontant une invasion extraterrestre, a semé la panique à travers le pays en 1938.",
    correctAnswer: false,
    explanation: "Une légende urbaine raconte qu'Orson Welles a déclenché une vague de panique et des émeutes aux États-Unis en adaptant ce roman à l'antenne. Le nombre d'auditeurs croyant à une réelle invasion a en réalité été largement surestimé par des médias et des chercheurs.",
    storyContext: "La radio, nouveau média de l'époque, a-t-elle vraiment rendu les gens fous ?",
    difficulty: 'medium'
  },
  {
    id: 5,
    type: QuestionType.TRUE_FALSE,
    text: "La popularité du Père Noël est due à Coca-Cola.",
    correctAnswer: true,
    explanation: "La multinationale américaine n'a pas inventé le Père Noël, mais a largement contribué à la diffusion de sa célèbre image dans le monde.",
    storyContext: "Le marketing peut parfois transformer la réalité en légende.",
    difficulty: 'easy'
  },
  {
    id: 7,
    type: QuestionType.TRUE_FALSE,
    text: "Le Monténégro et le Japon ont été en guerre pendant plus de 100 ans par oubli de signer un traité de paix.",
    correctAnswer: true,
    explanation: "Le Japon a reconnu le Monténégro en 2006, mettant fin officiellement à une guerre déclenchée par la participation symbolique du Monténégro à la guerre russo-japonaise de 1904 au côté de la Russie. Il s'agit d'une guerre prolongée par une « irrégularité diplomatique ».",
    storyContext: "L'histoire officielle peut parfois sembler plus folle que la fiction.",
    difficulty: 'medium'
  },
  {
    id: 8,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Comment appelle-t-on une fake news en français ?",
    choices: [
      { id: 'a', text: "Une infaux", isCorrect: false },
      { id: 'b', text: "Une intox", isCorrect: false },
      { id: 'c', text: "Une infox", isCorrect: true }
    ],
    explanation: "La Commission d'enrichissement de la langue française recommande d'utiliser le néologisme « infox », formé des termes « information » et « intoxication ».",
    storyContext: "Dernière étape : la terminologie officielle.",
    difficulty: 'easy'
  },
  {
    id: 9,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Qu'est-ce qu'une \"Fake News\" (infox) ?",
    choices: [
      { id: 'a', text: "Une erreur commise involontairement par un journaliste.", isCorrect: false },
      { id: 'b', text: "Une information délibérément fausse créée pour tromper le public.", isCorrect: true },
      { id: 'c', text: "Une opinion avec laquelle on n'est pas d'accord.", isCorrect: false }
    ],
    explanation: "La clé est l'intention. Une erreur de journaliste est une faute professionnelle, mais une \"fake news\" est une arme de manipulation conçue pour tromper ou nuire.",
    difficulty: 'easy'
  },
  {
    id: 10,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Quelle est la différence entre la désinformation et la mésinformation ?",
    choices: [
      { id: 'a', text: "La désinformation est intentionnelle, la mésinformation est une erreur partagée sans vouloir nuire.", isCorrect: true },
      { id: 'b', text: "La désinformation ne concerne que la politique.", isCorrect: false },
      { id: 'c', text: "Il n'y a aucune différence, ce sont des synonymes.", isCorrect: false }
    ],
    explanation: "On fait de la mésinformation quand on partage une rumeur en pensant aider ses proches. La désinformation, elle, est orchestrée par ceux qui créent le mensonge.",
    difficulty: 'medium'
  },
  {
    id: 11,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Qu'est-ce qu'un \"Deepfake\" ?",
    choices: [
      { id: 'a', text: "Un article très long et très documenté.", isCorrect: false },
      { id: 'b', text: "Une photo prise dans les profondeurs de l'océan.", isCorrect: false },
      { id: 'c', text: "Une vidéo ou un audio modifié par intelligence artificielle pour faire dire ou faire des choses à quelqu'un.", isCorrect: true }
    ],
    explanation: "Grâce à l'intelligence artificielle, on peut faire dire n'importe quoi à n'importe qui. Il faut désormais se méfier même de ce que l'on voit et entend en vidéo.",
    difficulty: 'medium'
  },
  {
    id: 12,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Pourquoi les fake news circulent-elles souvent plus vite que les vraies informations ?",
    choices: [
      { id: 'a', text: "Parce qu'elles sont mieux écrites.", isCorrect: false },
      { id: 'b', text: "Parce qu'elles jouent sur des émotions fortes (peur, colère, surprise).", isCorrect: true },
      { id: 'c', text: "Parce que les journalistes sont trop lents.", isCorrect: false }
    ],
    explanation: "La colère ou la peur nous poussent à réagir de manière impulsive. La vérité, souvent plus nuancée et \"ennuyeuse\", ne provoque pas le même clic réflexe.",
    difficulty: 'medium'
  },
  {
    id: 13,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Quel est le premier réflexe à avoir face à une information choc sur les réseaux sociaux ?",
    choices: [
      { id: 'a', text: "La partager immédiatement pour prévenir ses amis.", isCorrect: false },
      { id: 'b', text: "Commenter pour dire qu'on est choqué.", isCorrect: false },
      { id: 'c', text: "Vérifier la source et la date de publication.", isCorrect: true }
    ],
    explanation: "On appelle cela la pause numérique. Prendre 30 secondes pour voir qui parle et quand l'article a été écrit permet d'éviter 90% des pièges.",
    difficulty: 'easy'
  },
  {
    id: 14,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Qu'est-ce qu'un titre \"Putaclic\" (Clickbait) ?",
    choices: [
      { id: 'a', text: "Un titre informatif et neutre.", isCorrect: false },
      { id: 'b', text: "Un titre sensationnaliste qui incite à cliquer sans donner le contenu réel.", isCorrect: true },
      { id: 'c', text: "Un titre qui ne contient que des images.", isCorrect: false }
    ],
    explanation: "Le but est purement financier : générer des vues pour vendre de la publicité. Souvent, le contenu de l'article est décevant ou n'a rien à voir avec le titre.",
    difficulty: 'easy'
  },
  {
    id: 15,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Qu'est-ce que le \"Biais de confirmation\" ?",
    choices: [
      { id: 'a', text: "Le fait de vérifier chaque information deux fois.", isCorrect: false },
      { id: 'b', text: "Notre tendance naturelle à ne croire que les informations qui confirment ce que l'on pense déjà.", isCorrect: true },
      { id: 'c', text: "Un bug informatique sur les réseaux sociaux.", isCorrect: false }
    ],
    explanation: "Notre cerveau est \"fainéant\" : il accepte plus facilement ce qui lui fait plaisir et rejette ce qui le contredit. C'est le piège n°1 de notre esprit.",
    difficulty: 'medium'
  },
  {
    id: 16,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Si une photo semble douteuse, quel outil gratuit peut aider à vérifier son origine ?",
    choices: [
      { id: 'a', text: "La recherche inversée d'image (Google Images, TinEye).", isCorrect: true },
      { id: 'b', text: "Photoshop.", isCorrect: false },
      { id: 'c', text: "Un filtre Instagram.", isCorrect: false }
    ],
    explanation: "En glissant une image dans Google Images ou TinEye, on peut retrouver sa trace originale et vérifier si elle n'a pas été prise il y a 10 ans dans un autre pays.",
    difficulty: 'easy'
  },
  {
    id: 17,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Que signifie \"Vérifier la source\" ?",
    choices: [
      { id: 'a', text: "Regarder combien de \"likes\" l'article possède.", isCorrect: false },
      { id: 'b', text: "Identifier qui a écrit l'article et si le site est fiable ou parodique.", isCorrect: true },
      { id: 'c', text: "Lire les commentaires sous l'article.", isCorrect: false }
    ],
    explanation: "Regardez l'onglet \"À propos\" du site. S'il n'y a pas de mentions légales ou si le nom du site imite un grand média (ex: \"LeFigaro.co\" au lieu de \".fr\"), méfiez-vous.",
    difficulty: 'easy'
  },
  {
    id: 18,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Qu'est-ce qu'une \"Chambre d'écho\" sur Internet ?",
    choices: [
      { id: 'a', text: "Un forum où tout le monde se dispute.", isCorrect: false },
      { id: 'b', text: "Un environnement numérique où l'on n'est exposé qu'à des opinions identiques aux nôtres.", isCorrect: true },
      { id: 'c', text: "Un logiciel de montage audio.", isCorrect: false }
    ],
    explanation: "À force de ne suivre que des gens qui pensent comme nous, on finit par croire que le monde entier est d'accord avec nous, ce qui fausse notre vision de la réalité.",
    difficulty: 'medium'
  },
  {
    id: 19,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Un site parodique (comme Le Gorafi ou The Onion) diffuse-t-il des fake news ?",
    choices: [
      { id: 'a', text: "Oui, ce sont des menteurs.", isCorrect: false },
      { id: 'b', text: "Non, c'est de l'humour/satire, même si certains peuvent s'y tromper.", isCorrect: true },
      { id: 'c', text: "Seulement s'ils parlent de politique.", isCorrect: false }
    ],
    explanation: "La satire utilise l'humour pour critiquer la société. Le problème survient quand des internautes prennent ces blagues au premier degré.",
    difficulty: 'easy'
  },
  {
    id: 20,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Pourquoi est-il important de vérifier la date d'un article ?",
    choices: [
      { id: 'a', text: "Pour éviter de partager une information ancienne comme si elle était actuelle.", isCorrect: true },
      { id: 'b', text: "Pour savoir si l'auteur est jeune.", isCorrect: false },
      { id: 'c', text: "Pour calculer le temps de lecture.", isCorrect: false }
    ],
    explanation: "Une photo de manifestation datant de 2012 peut être republiée aujourd'hui pour faire croire à un chaos actuel. C'est une technique de manipulation très courante.",
    difficulty: 'easy'
  },
  {
    id: 21,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Qu'est-ce que \"l'astroturfing\" ?",
    choices: [
      { id: 'a', text: "Une technique de jardinage urbain.", isCorrect: false },
      { id: 'b', text: "Créer l'illusion d'un mouvement populaire massif à l'aide de faux comptes ou de bots.", isCorrect: true },
      { id: 'c', text: "L'étude des étoiles pour prédire l'avenir.", isCorrect: false }
    ],
    explanation: "Cela vient de \"AstroTurf\" (pelouse artificielle). On fait croire à une opinion majoritaire alors qu'il s'agit de quelques personnes utilisant des milliers de bots.",
    difficulty: 'hard'
  },
  {
    id: 22,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Quel est l'objectif principal de la plupart des créateurs de fake news ?",
    choices: [
      { id: 'a', text: "Aider les gens à mieux comprendre le monde.", isCorrect: false },
      { id: 'b', text: "Gagner de l'argent (publicité) ou manipuler l'opinion publique.", isCorrect: true },
      { id: 'c', text: "Tester la rapidité d'Internet.", isCorrect: false }
    ],
    explanation: "Soit ils veulent influencer un vote, soit ils cherchent à attirer du trafic sur un site rempli de publicités pour s'enrichir.",
    difficulty: 'easy'
  },
  {
    id: 23,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Qu'est-ce qu'un \"Fact-checker\" ?",
    choices: [
      { id: 'a', text: "Un journaliste spécialisé dans la vérification des faits et des rumeurs.", isCorrect: true },
      { id: 'b', text: "Un logiciel qui corrige les fautes d'orthographe.", isCorrect: false },
      { id: 'c', text: "Un policier du web.", isCorrect: false }
    ],
    explanation: "Ces experts remontent à la source, contactent les témoins et analysent les données pour confirmer ou infirmer une rumeur virale.",
    difficulty: 'medium'
  },
  {
    id: 24,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Si vous voyez une information sur un compte \"certifié\" (badge bleu), est-elle forcément vraie ?",
    choices: [
      { id: 'a', text: "Oui, le badge garantit la vérité du message.", isCorrect: false },
      { id: 'b', text: "Pas forcément, le badge peut parfois être acheté ou signifier simplement l'identité de la personne.", isCorrect: true },
      { id: 'c', text: "Non, les badges bleus sont réservés aux comptes de parodie.", isCorrect: false }
    ],
    explanation: "Sur certains réseaux (comme X/Twitter), n'importe qui peut acheter un badge bleu. Cela prouve parfois l'identité, mais jamais la véracité des propos tenus.",
    difficulty: 'medium'
  },
  {
    id: 25,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Comment appelle-t-on une information massive de rumeurs pendant une crise sanitaire ?",
    choices: [
      { id: 'a', text: "Une épidémie de texte.", isCorrect: false },
      { id: 'b', text: "Une infodémie.", isCorrect: true },
      { id: 'c', text: "Un virus médiatique.", isCorrect: false }
    ],
    explanation: "Le mélange d'informations fiables et de rumeurs rend la compréhension de la situation impossible pour le public, un peu comme un virus qui se propage.",
    difficulty: 'medium'
  },
  {
    id: 26,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Une image sans légende est-elle une preuve suffisante d'un événement ?",
    choices: [
      { id: 'a', text: "Oui, une image ne ment jamais.", isCorrect: false },
      { id: 'b', text: "Non, elle peut être détournée de son contexte original.", isCorrect: true },
      { id: 'c', text: "Oui, si elle est de bonne qualité.", isCorrect: false }
    ],
    explanation: "Une image ne montre qu'un instantané. Sans le contexte (lieu, date, avant/après), on peut lui faire dire tout et son contraire.",
    difficulty: 'medium'
  },
  {
    id: 27,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Que peut-on faire si on a partagé une fake news par erreur ?",
    choices: [
      { id: 'a', text: "Supprimer le post ou publier un correctif pour prévenir ses contacts.", isCorrect: true },
      { id: 'b', text: "Ne rien faire et attendre que les gens oublient.", isCorrect: false },
      { id: 'c', text: "Dire que c'était un test pour voir qui suivait.", isCorrect: false }
    ],
    explanation: "Il n'y a pas de honte à se tromper, mais laisser l'erreur en ligne continue de tromper les autres. Rectifier est un acte de responsabilité numérique.",
    difficulty: 'easy'
  },
  {
    id: 28,
    type: QuestionType.MULTIPLE_CHOICE,
    text: "Quel rôle jouent les algorithmes des réseaux sociaux dans la désinformation ?",
    choices: [
      { id: 'a', text: "Ils suppriment automatiquement toutes les mensonges.", isCorrect: false },
      { id: 'b', text: "Ils mettent en avant les contenus qui génèrent le plus d'engagement (souvent les plus polémiques).", isCorrect: true },
      { id: 'c', text: "Ils n'ont aucun impact sur ce que nous voyons.", isCorrect: false }
    ],
    explanation: "Les algorithmes sont conçus pour vous garder sur l'application. Comme le contenu polémique ou faux fait beaucoup réagir, ils ont tendance à le montrer à plus de monde.",
    difficulty: 'medium'
  }
];
