/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Search, 
  MessageSquare, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Terminal,
  Cpu,
  User,
  Send,
  Star,
  Award,
  Zap,
  BrainCircuit
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { QUIZ_QUESTIONS } from './constants';
import { QuestionType, AppState } from './types';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const BADGES = [
  { id: 'novice', name: 'Novice', icon: <Star className="w-4 h-4" />, threshold: 0 },
  { id: 'detecteur', name: 'Détecteur', icon: <Search className="w-4 h-4" />, threshold: 300 },
  { id: 'expert', name: 'Expert', icon: <Zap className="w-4 h-4" />, threshold: 600 },
  { id: 'maitre', name: 'Maître de la Vérité', icon: <Award className="w-4 h-4" />, threshold: 900 },
];

export default function App() {
  const [state, setState] = useState<AppState>({
    currentStep: 'intro',
    currentQuestionIndex: 0,
    score: 0,
    points: 0,
    level: 1,
    badges: ['novice'],
    consecutiveCorrect: 0,
    userAnswers: [],
    chatTurnCount: 0,
    bgHue: 240
  });

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLDivElement>(null);

  const currentQuestion = QUIZ_QUESTIONS[state.currentQuestionIndex];

  // Sound effects
  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const clickSound = "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"; // Subtle click
  const transitionSound = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; // Soft whoosh/pop
  const hoverSound = "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3"; // Very subtle hover

  const playHoverSound = () => {
    const audio = new Audio(hoverSound);
    audio.volume = 0.1; // Very quiet
    audio.play().catch(() => {});
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (showExplanation) {
      setTimeout(() => {
        nextButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showExplanation]);

  const handleStart = () => {
    playSound(transitionSound);
    setState(prev => ({ ...prev, currentStep: 'story' }));
  };

  const handleNextFromStory = () => {
    playSound(transitionSound);
    setState(prev => ({ ...prev, currentStep: 'quiz' }));
  };

  const handleAnswer = async (answer: string | boolean) => {
    if (showExplanation) return;
    playSound(clickSound);

    let isCorrect = false;
    if (currentQuestion.type === QuestionType.TRUE_FALSE) {
      isCorrect = answer === currentQuestion.correctAnswer;
      setSelectedChoice(answer ? 'true' : 'false');
    } else {
      const choice = currentQuestion.choices?.find(c => c.id === answer);
      isCorrect = !!choice?.isCorrect;
      setSelectedChoice(answer as string);
    }

    const newPoints = isCorrect ? state.points + 100 : state.points;
    const newConsecutive = isCorrect ? state.consecutiveCorrect + 1 : 0;
    const newLevel = Math.floor(newPoints / 300) + 1;
    
    const newBadges = [...state.badges];
    BADGES.forEach(badge => {
      if (newPoints >= badge.threshold && !newBadges.includes(badge.id)) {
        newBadges.push(badge.id);
      }
    });

    setShowExplanation(true);
    
    // Adaptive AI Feedback
    let adaptiveFeedback = "";
    if (isCorrect && newConsecutive >= 2) {
      adaptiveFeedback = "Bravo ! Tu as l'œil. Tu deviens vraiment bon pour voir les pièges.";
    } else if (!isCorrect) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const model = "gemini-3-flash-preview";
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: `L'utilisateur a fait une erreur sur : "${currentQuestion.text}". L'explication est : "${currentQuestion.explanation}". Donne un conseil tout simple (1 phrase) avec des mots faciles pour ne plus se faire avoir.` }] }]
        });
        adaptiveFeedback = response.text || "";
      } catch (error: any) {
        console.error("Feedback AI failed", error);
        if (error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 429) {
          setApiKeyError(true);
        }
        adaptiveFeedback = "C'est pas grave, on apprend de ses erreurs !";
      }
    }

    setState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      points: newPoints,
      level: newLevel,
      badges: newBadges,
      consecutiveCorrect: newConsecutive,
      adaptiveFeedback,
      userAnswers: [...prev.userAnswers, { questionId: currentQuestion.id, isCorrect }]
    }));
  };

  const handleNextQuestion = () => {
    playSound(transitionSound);
    setShowExplanation(false);
    setSelectedChoice(null);
    
    if (state.currentQuestionIndex === 2 && state.currentStep !== 'chatbot') {
      setState(prev => ({ ...prev, currentStep: 'chatbot' }));
      startChatbotSession();
      return;
    }

    // Dynamic Difficulty Selection
    const answeredIds = state.userAnswers.map(a => a.questionId);
    const remainingQuestions = QUIZ_QUESTIONS.filter(q => !answeredIds.includes(q.id));

    if (remainingQuestions.length === 0) {
      setState(prev => ({ ...prev, currentStep: 'results' }));
      return;
    }

    let targetDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (state.consecutiveCorrect >= 2) {
      targetDifficulty = 'hard';
    } else if (state.userAnswers.length > 0 && !state.userAnswers[state.userAnswers.length - 1].isCorrect) {
      targetDifficulty = 'easy';
    }

    // Find best match for difficulty
    let nextQuestion = remainingQuestions.find(q => q.difficulty === targetDifficulty);
    if (!nextQuestion) {
      // Fallback to any remaining
      nextQuestion = remainingQuestions[0];
    }

    const nextIndex = QUIZ_QUESTIONS.findIndex(q => q.id === nextQuestion?.id);

    setState(prev => ({ 
      ...prev, 
      currentQuestionIndex: nextIndex, 
      currentStep: 'quiz',
      bgHue: (prev.bgHue + 40) % 360
    }));
  };

  const startChatbotSession = () => {
    setChatMessages([
      { role: 'ai', text: "Salut agent ! Je suis là pour t'aider à devenir un pro du repérage de fake news. Tu savais qu'il y a des astuces simples pour ne pas se faire avoir ?" }
    ]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || state.chatTurnCount >= 3) return;

    const newMessages = [...chatMessages, { role: 'user' as const, text: userInput }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsTyping(true);

    const newTurnCount = state.chatTurnCount + 1;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";
      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `L'enquêteur répond. Analyse et poursuis brièvement si ce n'est pas le dernier tour. C'est le tour ${newTurnCount} sur 3. Réponse : "${userInput}"` }] }
        ],
        config: {
          systemInstruction: `Tu es VERITAS-9000, un bot qui aide les agents à déceler les fake news. Parle simplement, comme à un ami. 
          Utilise ces points pour conseiller l'utilisateur durant la conversation (3 tours max) :
          - Observer les détails : titres accrocheurs (MAJUSCULES, !!!), absence de dates ou lieux précis.
          - Vérifier la source : réputation du site, attention aux sites parodiques (Gorafi, Nord Presse). Utiliser Décodex du Monde si besoin.
          - Sources fiables : privilégier .gouv.fr, .org, .asso.fr (ministères, ONG, sciences). Vigilance sur les blogs.
          - Varier les sources : comparer plusieurs articles. Si plusieurs sites sérieux disent la même chose, c'est bon signe.
          - Images : faire une recherche inversée (Google images, Tineye) pour voir si l'image est détournée.
          
          Reste très court (max 2 phrases). Sois sympa et encourageant.`
        }
      });

      const aiText = response.text || "C'est un point de vue très intéressant.";
      
      if (newTurnCount >= 3) {
        setChatMessages([...newMessages, { role: 'ai', text: aiText + " Merci pour cet échange enrichissant ! Reprenons maintenant notre analyse." }]);
        setTimeout(() => {
          setState(prev => ({ ...prev, currentStep: 'quiz', currentQuestionIndex: prev.currentQuestionIndex + 1, chatTurnCount: 0 }));
        }, 3000);
      } else {
        setChatMessages([...newMessages, { role: 'ai', text: aiText }]);
      }
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 429) {
        setApiKeyError(true);
      }
      setChatMessages([...newMessages, { role: 'ai', text: "Désolé, j'ai eu une petite absence. Continuons l'enquête !" }]);
      if (newTurnCount >= 3) {
        setTimeout(() => {
          setState(prev => ({ ...prev, currentStep: 'quiz', currentQuestionIndex: prev.currentQuestionIndex + 1, chatTurnCount: 0 }));
        }, 2000);
      }
    } finally {
      setIsTyping(false);
      setState(prev => ({ ...prev, chatTurnCount: newTurnCount }));
    }
  };

  const renderIntro = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl w-full text-center space-y-8"
    >
      <div className="relative inline-block">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="bg-indigo-500/20 p-6 rounded-full border border-indigo-500/30"
        >
          <ShieldCheck className="w-20 h-20 text-indigo-400" />
        </motion.div>
        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
          PREMIUM
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-7xl font-bold tracking-tighter text-white uppercase italic drop-shadow-2xl">
          Veritas
        </h1>
        <p className="text-xl text-indigo-300 font-mono tracking-widest uppercase">
          Entraînement Anti-Fake News
        </p>
      </div>

      <p className="text-zinc-300 max-w-xl mx-auto leading-relaxed text-lg">
        Bienvenue agent. Vous cherchez la vérité ? Vous allez vous entraîner ici pour apprendre à repérer les mensonges et les fausses infos qui traînent partout.
      </p>

      <button 
        onClick={handleStart}
        onMouseEnter={playHoverSound}
        className="group relative px-10 py-5 bg-indigo-600 text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20 cursor-pointer"
      >
        <span className="relative z-10 flex items-center gap-2 text-lg">
          COMMENCER L'AVENTURE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-indigo-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>
    </motion.div>
  );

  const renderStory = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl w-full space-y-8"
    >
      <div className="flex items-center gap-4 text-indigo-400 font-mono text-sm">
        <BrainCircuit className="w-5 h-5" />
        <span>ANALYSE COGNITIVE EN COURS...</span>
      </div>
      
      <div className="space-y-6 text-3xl font-light leading-tight text-white italic">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          "Le monde est une toile de récits. Certains sont des ponts, d'autres sont des pièges."
        </motion.p>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
        >
          "Votre voyage commence ici. Chaque réponse correcte vous rapproche de la maîtrise."
        </motion.p>
      </div>

      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        onClick={handleNextFromStory}
        onMouseEnter={playHoverSound}
        className="flex items-center gap-3 text-indigo-300 hover:text-white transition-colors group text-xl cursor-pointer"
      >
        COMMENCER L'ENTRAÎNEMENT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );

  const renderQuiz = () => (
    <motion.div 
      key={state.currentQuestionIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl w-full space-y-8"
    >
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            {state.level}
          </div>
          <div>
            <p className="text-[10px] text-indigo-300 font-mono uppercase tracking-widest">Niveau Actuel</p>
            <p className="text-white font-bold">{state.points} Points</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {BADGES.map(badge => (
            <div 
              key={badge.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${state.badges.includes(badge.id) ? 'bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/20' : 'bg-zinc-800 text-zinc-600'}`}
              title={badge.name}
            >
              {badge.icon}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest ${state.consecutiveCorrect >= 2 ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-500/20 text-indigo-300'}`}>
            {state.consecutiveCorrect >= 2 ? 'Mode Challenge' : 'Analyse Standard'}
          </div>
          <span className="text-xs font-mono text-zinc-500">Question {state.userAnswers.length + 1} / {QUIZ_QUESTIONS.length}</span>
        </div>
        <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
          {currentQuestion.text}
        </h2>
      </div>

      <div className="grid gap-4">
        {currentQuestion.type === QuestionType.TRUE_FALSE ? (
          <div className="grid grid-cols-2 gap-4">
            {[true, false].map((val) => (
              <button
                key={val.toString()}
                onClick={() => handleAnswer(val)}
                onMouseEnter={playHoverSound}
                disabled={showExplanation}
                className={`
                  p-8 rounded-3xl border-2 transition-all text-2xl font-black tracking-tighter cursor-pointer
                  ${!showExplanation ? 'border-white/10 hover:border-indigo-500 hover:bg-indigo-500/10 text-zinc-400 hover:text-white' : ''}
                  ${showExplanation && val === currentQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/10' : ''}
                  ${showExplanation && val !== currentQuestion.correctAnswer && selectedChoice === val.toString() ? 'border-red-500 bg-red-500/20 text-white shadow-lg shadow-red-500/10' : ''}
                  ${showExplanation && val !== currentQuestion.correctAnswer && selectedChoice !== val.toString() ? 'border-white/5 opacity-30 text-zinc-600' : ''}
                `}
              >
                {val ? 'VRAI' : 'FAUX'}
              </button>
            ))}
          </div>
        ) : (
          currentQuestion.choices?.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleAnswer(choice.id)}
              onMouseEnter={playHoverSound}
              disabled={showExplanation}
              className={`
                p-6 rounded-3xl border-2 text-left transition-all flex justify-between items-center group cursor-pointer
                ${!showExplanation ? 'border-white/10 hover:border-indigo-500 hover:bg-indigo-500/10 text-zinc-400 hover:text-white' : ''}
                ${showExplanation && choice.isCorrect ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/10' : ''}
                ${showExplanation && !choice.isCorrect && selectedChoice === choice.id ? 'border-red-500 bg-red-500/20 text-white shadow-lg shadow-red-500/10' : ''}
                ${showExplanation && !choice.isCorrect && selectedChoice !== choice.id ? 'border-white/5 opacity-30 text-zinc-600' : ''}
              `}
            >
              <span className="text-xl font-medium">{choice.text}</span>
              <div className="flex items-center gap-2">
                {showExplanation && choice.isCorrect && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                {showExplanation && !choice.isCorrect && selectedChoice === choice.id && <XCircle className="w-8 h-8 text-red-500" />}
                {!showExplanation && <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
              </div>
            </button>
          ))
        )}
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-indigo-300 font-bold text-lg">
                <HelpCircle className="w-6 h-6" />
                <span>DÉCRYPTAGE EXPERT</span>
              </div>
              {state.adaptiveFeedback && (
                <div className="flex items-center gap-2 text-yellow-500 text-xs font-mono bg-yellow-500/10 px-3 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  <span>CONSEIL IA</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <p className="text-zinc-200 text-lg leading-relaxed">
                {currentQuestion.explanation}
              </p>
              {state.adaptiveFeedback && (
                <p className="text-indigo-200 italic border-l-2 border-indigo-500 pl-4 py-1">
                  "{state.adaptiveFeedback}"
                </p>
              )}
            </div>

            <div ref={nextButtonRef} className="pt-4">
              <button 
                onClick={handleNextQuestion}
                onMouseEnter={playHoverSound}
                className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 text-xl shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                ÉQUATION SUIVANTE <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderChatbot = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl w-full h-[650px] bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 flex flex-col overflow-hidden shadow-2xl"
    >
      <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-none">VERITAS-9000</h3>
            <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest">Interface de Mission • {3 - state.chatTurnCount} cycles restants</span>
          </div>
        </div>
        <button 
          onClick={() => setState(prev => ({ ...prev, currentStep: 'quiz', currentQuestionIndex: prev.currentQuestionIndex + 1, chatTurnCount: 0 }))}
          onMouseEnter={playHoverSound}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[10px] font-mono text-zinc-400 hover:text-white transition-all uppercase tracking-widest"
        >
          Passer l'entretien →
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
        {chatMessages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[85%] p-5 rounded-3xl text-base leading-relaxed shadow-xl
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white/10 text-zinc-100 rounded-tl-none border border-white/5'}
            `}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-5 rounded-3xl rounded-tl-none flex gap-2">
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 bg-black/40 border-t border-white/10">
        <div className="relative">
          <input 
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={state.chatTurnCount >= 3 ? "Analyse terminée..." : "Transmission..."}
            disabled={state.chatTurnCount >= 3 || isTyping}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-white text-base focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600"
          />
          <button 
            onClick={handleSendMessage}
            onMouseEnter={playHoverSound}
            disabled={state.chatTurnCount >= 3 || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderResults = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl w-full text-center space-y-12"
    >
      <div className="space-y-6">
        <div className="relative inline-block">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-40px] bg-indigo-500/20 rounded-full blur-[60px]"
          />
          <div className="relative z-10 p-8 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl">
            <Trophy className="w-32 h-32 text-yellow-500 mx-auto drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">Maître de la Vérité</h2>
          <p className="text-indigo-300 font-mono tracking-[0.3em] uppercase text-sm">Certification de Niveau {state.level} Obtenue</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
          <p className="text-4xl font-black text-white">{state.points}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-mono mt-2 tracking-widest">Points</p>
        </div>
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
          <p className="text-4xl font-black text-white">{state.score}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-mono mt-2 tracking-widest">Succès</p>
        </div>
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
          <p className="text-4xl font-black text-white">{Math.round((state.score / QUIZ_QUESTIONS.length) * 100)}%</p>
          <p className="text-[10px] text-zinc-500 uppercase font-mono mt-2 tracking-widest">Précision</p>
        </div>
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
          <p className="text-4xl font-black text-white">{state.badges.length}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-mono mt-2 tracking-widest">Badges</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {BADGES.filter(b => state.badges.includes(b.id)).map(badge => (
          <div key={badge.id} className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-full text-yellow-500 font-bold text-sm">
            {badge.icon}
            <span>{badge.name}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => window.location.reload()}
        onMouseEnter={playHoverSound}
        className="px-16 py-6 bg-white text-black font-black rounded-full hover:scale-105 transition-all shadow-2xl shadow-white/10 text-xl uppercase tracking-widest cursor-pointer"
      >
        RELEVER LE DÉFI À NOUVEAU
      </button>
    </motion.div>
  );

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKeyError(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
      {/* API Key Error Overlay */}
      <AnimatePresence>
        {apiKeyError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-zinc-900 border border-white/10 p-8 rounded-[32px] text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Quota Épuisé</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Le système a atteint sa limite d'utilisation gratuite. Pour continuer à utiliser les fonctions vocales et l'IA avancée, veuillez sélectionner votre propre clé API (projet payant requis).
                </p>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-400 text-xs hover:underline block pt-2"
                >
                  En savoir plus sur la facturation Gemini API
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSelectKey}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  SÉLECTIONNER UNE CLÉ API
                </button>
                <button 
                  onClick={() => setApiKeyError(false)}
                  className="w-full py-4 bg-white/5 text-zinc-400 font-medium rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                >
                  Continuer sans IA (Mode Dégradé)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ backgroundColor: `hsl(${state.bgHue}, 60%, 8%)` }}
          className="absolute inset-0 transition-colors duration-1000"
        />
        <motion.div 
          animate={{ backgroundColor: `hsl(${state.bgHue}, 80%, 25%)` }}
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-35 transition-colors duration-1000"
        />
        <motion.div 
          animate={{ backgroundColor: `hsl(${(state.bgHue + 60) % 360}, 80%, 25%)` }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-25 transition-colors duration-1000"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
      </div>

      {/* Header */}
      <header className="relative z-50 p-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-lg tracking-tighter uppercase italic block leading-none">Veritas</span>
            <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-[0.4em]">Protocol v3.0</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Trophy className="w-3 h-3 text-yellow-500" />
              <span className="text-[10px] font-mono text-white">{state.points} PTS</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-mono text-white">LVL {state.level}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-8 -mt-12">
        <AnimatePresence mode="wait">
          {state.currentStep === 'intro' && renderIntro()}
          {state.currentStep === 'story' && renderStory()}
          {state.currentStep === 'quiz' && renderQuiz()}
          {state.currentStep === 'chatbot' && renderChatbot()}
          {state.currentStep === 'results' && renderResults()}
        </AnimatePresence>
      </main>

      {/* Footer / Status Bar */}
      <footer className="relative z-50 p-6 border-t border-white/5 bg-black/20 backdrop-blur-xl flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" /> Système Actif</span>
          <span className="hidden sm:inline">Noyau: Gemini 3 Flash</span>
        </div>
        <div className="flex gap-8">
          <span className="hidden md:inline">Session: {state.userAnswers.length} Analyses</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
}
