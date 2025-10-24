import React, { useState, useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { LoadingScreen, loadingPhases } from './LoadingScreen';
import { ResultsPage } from './ResultsPage';
import { LeadCaptureForm } from './LeadCaptureForm';
import { quizQuestions, QuizResponse, Question } from './quizData';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api/config';

type QuizStep = 'quiz' | 'loading' | 'lead' | 'results';

interface QuizState {
  currentQuestion: number;
  responses: QuizResponse[];
  step: QuizStep;
  loadingPhase: number;
  resultId?: number | null;
  answersObject?: Record<string, any>;
}

export const QuizContainer: React.FC<{ ignoreSaved?: boolean }> = ({ ignoreSaved = false }) => {
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState<QuizState>(() => {
    if (!ignoreSaved) {
      // Load saved state from localStorage
      const saved = localStorage.getItem('fulani-hair-quiz');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Merge with defaults; do not trust transient fields
          return {
            currentQuestion: typeof parsed.currentQuestion === 'number' ? parsed.currentQuestion : 0,
            responses: Array.isArray(parsed.responses) ? parsed.responses : [],
            step: 'quiz',
            loadingPhase: 0,
            resultId: null,
            answersObject: {},
          } as QuizState;
        } catch {
          // fallthrough to fresh state
        }
      }
    }
    return {
      currentQuestion: 0,
      responses: [],
      step: 'quiz' as QuizStep,
      loadingPhase: 0,
      resultId: null,
      answersObject: {},
    };
  });

  const buildResponsesObject = () => {
    const mapped: Record<string, any> = {};
    quizQuestions.forEach((q, index) => {
      const ans = quizState.responses.find(r => r.questionId === q.id)?.answer;
      const key = `q${index + 1}`;
      mapped[key] = ans ?? null;
    });
    return mapped;
  };

  const handleQuizSubmit = async (emailValue?: string) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const responses = buildResponsesObject();
      const resp = await apiClient.post('/api/quiz/submit', {
        responses,
        email: emailValue || undefined,
      });
      const submissionId = resp?.data?.submissionId;
      if (submissionId) {
        window.location.assign(`/landing.html?submissionId=${submissionId}`);
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (error: any) {
      setSubmitError(error?.response?.data?.error || error?.message || 'Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Save only durable state to localStorage (avoid persisting loading state)
  useEffect(() => {
    const durable = {
      currentQuestion: quizState.currentQuestion,
      responses: quizState.responses,
    };
    localStorage.setItem('fulani-hair-quiz', JSON.stringify(durable));
  }, [quizState.currentQuestion, quizState.responses]);

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
      // Start multi-phase loading process (origin)
      setQuizState(prev => ({
        ...prev,
        step: 'loading',
        loadingPhase: 0
      }));

      // Phase scheduler: auto-advance through all but the final CTA phase (origin)
      let phaseIndex = 0;
      const scheduleNext = () => {
        const next = phaseIndex + 1;
        if (next >= loadingPhases.length) return; // safety
        phaseIndex = next;
        setQuizState(prev => ({ ...prev, loadingPhase: phaseIndex }));
        const isFinal = phaseIndex === loadingPhases.length - 1;
        if (!isFinal) {
          const dur = loadingPhases[phaseIndex].duration || 0;
          window.setTimeout(scheduleNext, dur);
        } else {
          // Final phase shows CTA; wait for user to click "View Your Complete Hair Analysis"
        }
      };
      const firstDuration = loadingPhases[0].duration || 0;
      window.setTimeout(scheduleNext, firstDuration);

      // Prepare answers for submission and submit to backend early (we will update with lead fields later)
      try {
        const answersObject = quizState.responses.reduce((acc: Record<string, any>, r) => {
          acc[r.questionId] = r.answer;
          return acc;
        }, {});

        // store answers locally for potential fallback create if DB returned no id
        setQuizState(prev => ({ ...prev, answersObject }));
      } catch {}
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: nextQuestionIndex
      }));
    }
  };

  // If the page was refreshed during loading, resume the phase scheduler so it doesn't stick on phase 0
  useEffect(() => {
    if (quizState.step === 'loading') {
      let cancelled = false;
      let phaseIndex = quizState.loadingPhase;
      const scheduleNext = () => {
        if (cancelled) return;
        const next = phaseIndex + 1;
        if (next >= loadingPhases.length) return; // safety
        phaseIndex = next;
        setQuizState(prev => ({ ...prev, loadingPhase: phaseIndex }));
        const isFinal = phaseIndex === loadingPhases.length - 1;
        if (!isFinal) {
          const dur = loadingPhases[phaseIndex].duration || 0;
          window.setTimeout(scheduleNext, dur);
        }
      };
      // Kick off from the current phase
      const dur = loadingPhases[Math.max(0, Math.min(phaseIndex, loadingPhases.length - 1))].duration || 0;
      const timer = window.setTimeout(scheduleNext, dur);
      return () => { cancelled = true; window.clearTimeout(timer); };
    }
  }, [quizState.step, quizState.loadingPhase]);

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

  // Submitting state UI
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800">Analyzing Your Hair Loss...</h2>
        <p className="text-gray-600 mt-2">Creating your personalized treatment plan</p>
        {submitError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{submitError}</div>
        )}
      </div>
    );
  }

  if (quizState.step === 'loading') {
    return (
      <LoadingScreen
        phase={quizState.loadingPhase}
        responses={quizState.responses}
        onViewResults={() => setQuizState(prev => ({ ...prev, step: 'lead' }))}
      />
    );
  }

  if (quizState.step === 'lead') {
    const handleLeadSubmit = async (values: { name: string; email?: string; phone: string; state: string; }) => {
      await handleQuizSubmit(values.email ?? undefined);
    };

    return (
      <LeadCaptureForm onSubmit={handleLeadSubmit} />
    );
  }

  if (quizState.step === 'results') {
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
            <p className="text-xs md:text-sm font-medium text-[#DAA520]">Much Cheaper Than A Hair Transplant</p>
          </div>
          {/* Progress Meta */}
          <div className="text-right">
            <p className="text-sm font-bold text-gray-700">Question {safeIndex + 1} of {total}</p>
            <span className="inline-block text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
              {Math.round(((safeIndex + 1) / Math.max(1, total)) * 100)}% Complete
            </span>
            <div className="text-[10px] text-gray-500 mt-1">🔒 Secure • Quick 3-min quiz</div>
          </div>
        </div>
        {/* Progress Bar */}
        <div
          className="h-1 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
          style={{ width: `${(((safeIndex + 1) / Math.max(1, total)) * 100)}%` }}
        />
      </div>

      {/* Main Content - Centered, No Scroll Needed */}
      <div className="flex-1 flex items-center justify-center px-4 pt-28 pb-8">
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
      <div className="text-center pb-4 text-sm text-gray-600">
        <p className="font-medium">🔒 Your answers are private and secure <span className="mx-1">✓</span> <span className="font-semibold text-gray-800">10,000+ women</span> completed this quiz</p>
        <p className="mt-0.5 text-[9px] text-gray-300">By clicking any of the options above, you agree with the Terms of Use and Service and Privacy Policy.</p>
      </div>
    </div>
  );
};