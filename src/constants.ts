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
  }
];
