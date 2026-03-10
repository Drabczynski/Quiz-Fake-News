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
import { QUIZ_QUESTIONS } from './constants';
import { QuestionType, AppState } from './types';
import { scorm } from './scorm';

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
    bgHue: 240
  });

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isCompletedRef = useRef(false);

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
    scorm.init();
    scorm.setCompletionStatus('incomplete');
    return () => {
      if (!isCompletedRef.current) {
        scorm.setExitStatus('suspend');
      }
      scorm.terminate();
    };
  }, []);

  useEffect(() => {
    if (showExplanation) {
      setTimeout(() => {
        nextButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showExplanation]);

  useEffect(() => {
    if (state.currentStep === 'intro' && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Autoplay failed:", err);
      });
    }
  }, [state.currentStep]);

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

    // Update state immediately to prevent race conditions
    setState(prev => {
      const updatedState = {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        points: newPoints,
        level: newLevel,
        badges: newBadges,
        consecutiveCorrect: newConsecutive,
        userAnswers: [...prev.userAnswers, { questionId: currentQuestion.id, isCorrect }],
        adaptiveFeedback: null // Reset feedback for each answer
      };

      // Update SCORM score
      const totalQuestions = QUIZ_QUESTIONS.length;
      const rawScore = updatedState.score;
      const scaledScore = rawScore / totalQuestions;
      scorm.setScore(rawScore, 0, totalQuestions, scaledScore);

      // Update SCORM Objective "1" - "Fake News"
      scorm.setObjective("1", "Fake News", scaledScore, scaledScore >= 0.7 ? "passed" : "failed");

      // Record SCORM Interaction
      const learnerResponse = currentQuestion.type === QuestionType.TRUE_FALSE 
        ? (answer ? "true" : "false")
        : (currentQuestion.choices?.find(c => c.id === answer)?.text || answer.toString());
      
      const correctAnswer = currentQuestion.type === QuestionType.TRUE_FALSE
        ? (currentQuestion.correctAnswer ? "true" : "false")
        : (currentQuestion.choices?.find(c => c.isCorrect)?.text || "");

      scorm.recordInteraction(
        `q_${currentQuestion.id}`,
        currentQuestion.type === QuestionType.TRUE_FALSE ? "true-false" : "choice",
        currentQuestion.text,
        learnerResponse,
        isCorrect ? "correct" : "incorrect",
        correctAnswer,
        "1"
      );

      return updatedState;
    });

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    playSound(transitionSound);
    setShowExplanation(false);
    setSelectedChoice(null);
    
    // Dynamic Difficulty Selection
    const answeredIds = state.userAnswers.map(a => a.questionId);
    const remainingQuestions = QUIZ_QUESTIONS.filter(q => !answeredIds.includes(q.id));

    if (remainingQuestions.length === 0) {
      isCompletedRef.current = true;
      setState(prev => ({ ...prev, currentStep: 'results' }));
      scorm.setCompletionStatus('completed');
      const finalScore = state.score / QUIZ_QUESTIONS.length;
      scorm.setSuccessStatus(finalScore >= 0.7 ? 'passed' : 'failed');
      scorm.setExitStatus('normal');
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



  const renderIntro = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl w-full text-center space-y-8 relative z-10"
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
            </div>
            
            <div className="space-y-4">
              <p className="text-zinc-200 text-lg leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>

            <div ref={nextButtonRef} className="pt-4">
              <button 
                onClick={handleNextQuestion}
                onMouseEnter={playHoverSound}
                className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 text-xl shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                QUESTION SUIVANTE <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        onClick={() => {
          scorm.resetInteractions();
          window.location.reload();
        }}
        onMouseEnter={playHoverSound}
        className="px-16 py-6 bg-white text-black font-black rounded-full hover:scale-105 transition-all shadow-2xl shadow-white/10 text-xl uppercase tracking-widest cursor-pointer"
      >
        RELEVER LE DÉFI À NOUVEAU
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a14] text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Base Background Color */}
        <motion.div 
          animate={{ backgroundColor: `hsl(${state.bgHue}, 60%, 8%)` }}
          className="absolute inset-0 z-0 transition-colors duration-1000"
        />

        {/* Background Video (Intro Only) */}
        {state.currentStep === 'intro' && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              src="https://onlineformapro.com/videos/onl-video.mp4"
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1920"
            />
            <div className="absolute inset-0 bg-black/40 z-10" />
          </div>
        )}

        {/* Decorative Glows */}
        <motion.div 
          animate={{ backgroundColor: `hsl(${state.bgHue}, 80%, 25%)` }}
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-35 z-20 transition-colors duration-1000"
        />
        <motion.div 
          animate={{ backgroundColor: `hsl(${(state.bgHue + 60) % 360}, 80%, 25%)` }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-25 z-20 transition-colors duration-1000"
        />
        
        {/* Texture Overlays */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 z-30" />
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
          {state.currentStep === 'results' && renderResults()}
        </AnimatePresence>
      </main>

      {/* Footer / Status Bar */}
      <footer className="relative z-50 p-6 border-t border-white/5 bg-black/20 backdrop-blur-xl flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" /> Système Actif</span>
        </div>
        <div className="flex gap-8">
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
}
