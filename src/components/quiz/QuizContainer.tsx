import React, { useState, useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { LoadingScreen, loadingPhases } from './LoadingScreen';
import { ResultsPage } from './ResultsPage';
import { quizQuestions, QuizResponse, Question } from './quizData';

type QuizStep = 'quiz' | 'loading' | 'results';

interface QuizState {
  currentQuestion: number;
  responses: QuizResponse[];
  step: QuizStep;
  loadingPhase: number;
}

export const QuizContainer: React.FC<{ ignoreSaved?: boolean }> = ({ ignoreSaved = false }) => {
  const [quizState, setQuizState] = useState<QuizState>(() => {
    if (!ignoreSaved) {
      // Load saved state from localStorage
      const saved = localStorage.getItem('fulani-hair-quiz');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallthrough to fresh state
        }
      }
    }
    return {
      currentQuestion: 0,
      responses: [],
      step: 'quiz' as QuizStep,
      loadingPhase: 0
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fulani-hair-quiz', JSON.stringify(quizState));
  }, [quizState]);

  const total = quizQuestions.length;
  const safeIndex = Math.min(
    Math.max(0, quizState.currentQuestion),
    Math.max(0, total - 1)
  );

  // Ensure state stays in-bounds after question list edits
  useEffect(() => {
    if (quizState.currentQuestion !== safeIndex || quizState.responses.length) {
      const validIds = new Set(quizQuestions.map(q => q.id));
      const filteredResponses = quizState.responses.filter(r => validIds.has(r.questionId));
      if (quizState.currentQuestion !== safeIndex || filteredResponses.length !== quizState.responses.length) {
        setQuizState(prev => ({
          ...prev,
          currentQuestion: safeIndex,
          responses: filteredResponses
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, total]);

  const currentQuestion = quizQuestions[safeIndex];
  const progress = total > 0 ? (((safeIndex + 1) / total) * 100) : 0;

  const getAnswerFor = (id: string) => quizState.responses.find(r => r.questionId === id)?.answer;

  const isAnsweredStrict = (q: Question): boolean => {
    const ans = getAnswerFor(q.id);
    switch (q.type) {
      case 'multiple':
        return Array.isArray(ans) && ans.length > 0;
      case 'single':
      case 'binary':
        return typeof ans === 'string' && ans.trim().length > 0;
      case 'date':
        return typeof ans === 'string' && ans.trim().length > 0;
      case 'slider':
        return ans !== null && ans !== undefined;
      default:
        return !!ans;
    }
  };

  const handleAnswer = (answer: any) => {
    const newResponse: QuizResponse = {
      questionId: currentQuestion.id,
      answer
    };

    const updatedResponses = [...quizState.responses];
    const existingIndex = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
    
    if (existingIndex >= 0) {
      updatedResponses[existingIndex] = newResponse;
    } else {
      updatedResponses.push(newResponse);
    }

    setQuizState(prev => ({
      ...prev,
      responses: updatedResponses
    }));
  };

  const handleNext = () => {
    // Skip conditional questions if needed
    const nextQuestionIndex = safeIndex + 1;

    if (nextQuestionIndex >= quizQuestions.length) {
      // Start multi-phase loading process (38s total + CTA)
      setQuizState(prev => ({
        ...prev,
        step: 'loading',
        loadingPhase: 0
      }));

      // Phase scheduler: auto-advance through all but the final CTA phase
      let phaseIndex = 0;
      const scheduleNext = () => {
        // Determine next phase index
        const next = phaseIndex + 1;
        if (next >= loadingPhases.length) return; // safety
        phaseIndex = next;
        setQuizState(prev => ({ ...prev, loadingPhase: phaseIndex }));
        const isFinal = phaseIndex === loadingPhases.length - 1;
        if (!isFinal) {
          const dur = loadingPhases[phaseIndex].duration || 0;
          window.setTimeout(scheduleNext, dur);
        }
        // If final (CTA) phase, stop scheduling and wait for user click
      };

      const firstDuration = loadingPhases[0].duration || 0;
      window.setTimeout(scheduleNext, firstDuration);
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: nextQuestionIndex
      }));
    }
  };

  const handlePrevious = () => {
    if (safeIndex > 0) {
      const prevQuestionIndex = safeIndex - 1;
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prevQuestionIndex
      }));
    }
  };

  const resetQuiz = () => {
    localStorage.removeItem('fulani-hair-quiz');
    setQuizState({
      currentQuestion: 0,
      responses: [],
      step: 'quiz',
      loadingPhase: 0
    });
  };

  if (quizState.step === 'loading') {
    return (
      <LoadingScreen
        phase={quizState.loadingPhase}
        responses={quizState.responses}
        onViewResults={() => setQuizState(prev => ({ ...prev, step: 'results' }))}
      />
    );
  }

  if (quizState.step === 'results') {
    // Lightweight redirect component
    const RedirectToLanding: React.FC = () => {
      useEffect(() => {
        window.location.assign('/landing.html');
      }, []);
      return null;
    };
    return <RedirectToLanding />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      {/* Fixed Header with Brand & Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b-2 border-amber-400">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Brand */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">FULANI HAIR GRO</h1>
            <p className="text-xs md:text-sm text-amber-700 font-medium">Much Cheaper Than A Hair Transplant</p>
          </div>
          {/* Progress Meta */}
          <div className="text-right">
            <p className="text-sm font-bold text-gray-700">Question {safeIndex + 1} of {total}</p>
            <span className="inline-block text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
              {Math.round(((safeIndex + 1) / Math.max(1, total)) * 100)}% Complete
            </span>
          </div>
        </div>
        {/* Progress Bar */}
        <div
          className="h-2 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
          style={{ width: `${(((safeIndex + 1) / Math.max(1, total)) * 100)}%` }}
        />
      </div>

      {/* Main Content - Centered, No Scroll Needed */}
      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-8">
        <div className="w-full max-w-3xl">
          <QuestionCard
            question={currentQuestion}
            currentAnswer={quizState.responses.find(r => r.questionId === currentQuestion.id)?.answer}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoBack={safeIndex > 0}
            isAnswered={isAnsweredStrict(currentQuestion)}
          />
        </div>
      </div>

      {/* Trust Badge - Bottom (optional) */}
      <div className="text-center pb-6 text-sm text-gray-600">
        <p>🔒 Your answers are private and secure • 10,000+ women completed this quiz</p>
      </div>
    </div>
  );
};