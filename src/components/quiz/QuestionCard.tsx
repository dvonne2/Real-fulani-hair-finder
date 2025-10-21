import React, { useState } from 'react';
import { Question } from './quizData';

interface QuestionCardProps {
  question: Question;
  currentAnswer?: any;
  onAnswer: (answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
  isAnswered: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentAnswer,
  onAnswer,
  onNext,
  onPrevious,
  canGoBack,
  isAnswered
}) => {
  const [localAnswer, setLocalAnswer] = useState(currentAnswer);
  const [confirmationMsg, setConfirmationMsg] = useState<string | null>(null);

  const handleAnswerChange = (answer: any) => {
    setLocalAnswer(answer);
    onAnswer(answer);
    setConfirmationMsg('Great! One step closer to healthier hair');
    window.setTimeout(() => setConfirmationMsg(null), 1200);
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'single':
        return (
          <div className="options-area">
            <div className="text-[10px] font-semibold text-gray-400 mb-2">Choose one</div>
            <div className="options-grid grid grid-cols-1 md:grid-cols-2">
              {question.options?.map((option, index) => {
                const selected = localAnswer === option;
                return (
                  <div key={index} className="relative" onClick={() => handleAnswerChange(option)}>
                    <div
                      className={
                        `option-card flex items-center gap-3 bg-white cursor-pointer transition-all duration-300 border-2 ` +
                        (selected
                          ? 'selected border-[#DAA520] shadow-[0_10px_30px_rgba(218,165,32,0.12)]'
                          : 'border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[#DAA520] hover:translate-x-1.5')
                      }
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-[#DAA520]' : 'border-black/20 bg-white'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${selected ? 'bg-[#DAA520]' : 'bg-transparent'}`} />
                      </div>
                      <span className="option-text font-montserrat font-medium">{option}</span>
                      {/* No trailing check bubble for radio style */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'multiple':
        return (
          <div className="options-area">
            <div className="options-grid grid grid-cols-1 md:grid-cols-2">
              {question.options?.map((option, index) => {
                const selected = Array.isArray(localAnswer) && localAnswer.includes(option);
                return (
                  <div key={index} className="relative" onClick={() => {
                    const currentAnswers = Array.isArray(localAnswer) ? localAnswer : [];
                    const newAnswers = currentAnswers.includes(option)
                      ? currentAnswers.filter(a => a !== option)
                      : [...currentAnswers, option];
                    handleAnswerChange(newAnswers);
                  }}>
                    <div className={
                      `option-card flex items-center gap-3 bg-white cursor-pointer transition-all duration-300 border-2 ` +
                      (selected
                        ? 'selected border-[#DAA520] shadow-[0_10px_30px_rgba(218,165,32,0.12)]'
                        : 'border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[#DAA520] hover:translate-x-1.5')
                    }>
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selected ? 'border-[#DAA520] bg-[linear-gradient(135deg,#DAA520,#f4d03f)]' : 'border-black/20 bg-white'}`}>
                        <span className={`text-white font-bold text-[11px] transition-all ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>✓</span>
                      </div>
                      <span className="option-text font-montserrat font-medium">{option}</span>
                      {selected && (
                        <div className="absolute right-4 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[12px]"
                          style={{ background: 'linear-gradient(135deg, #DAA520, #f4d03f)' }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'binary':
        return (
          <div className="grid grid-cols-2 gap-3">
            {['Yes', 'No'].map((option) => {
              const selected = localAnswer === option;
              return (
                <div
                  key={option}
                  className={
                    `p-4 rounded-2xl border-2 text-center cursor-pointer transition-all ` +
                    (selected ? 'border-[#ff8e53] bg-[#fff8f0] shadow-[0_8px_25px_rgba(255,142,83,0.15)]' : 'border-black/10 hover:bg-[#fafafa] hover:border-black/15')
                  }
                  onClick={() => handleAnswerChange(option)}
                >
                  <span className="font-montserrat font-bold" style={{ fontSize: 'clamp(1.05rem, 2vw, 1.1rem)' }}>{option}</span>
                </div>
              );
            })}
          </div>
        );


      case 'date':
        return (
          <div className="space-y-4">
            <input
              type="date"
              value={localAnswer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              style={{ fontSize: 'clamp(1rem, 2vw, 1.05rem)' }}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="premium-card">
      <div className="mb-3 md:mb-4">
        <h2 className="question-title-premium text-center" style={{ fontSize: 'clamp(1.35rem, 3vw, 2rem)', lineHeight: 1.15 }}>{question.title}</h2>
        {question.description && (
          <p className="text-[hsl(var(--gray-medium))] font-montserrat text-center" style={{ fontSize: 'clamp(0.88rem, 1.8vw, 0.95rem)' }}>
            {question.description}
          </p>
        )}
      </div>

      <div className="mb-4 md:mb-5">
        {renderQuestionContent()}
      </div>

      {confirmationMsg && (
        <div className="text-center text-green-600 text-xs mb-2">{confirmationMsg}</div>
      )}
      <div className="cta-sticky space-y-3 mt-3 md:mt-4">
        <button
          onClick={onNext}
          disabled={!isAnswered}
          className="continue-btn w-full rounded-[60px] px-8 py-3.5 font-montserrat font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundImage: 'linear-gradient(135deg, #B57EDC 0%, #DAA520 100%)', boxShadow: '0 15px 50px rgba(218,165,32,0.35)' }}
        >
          Get your personalized plan →
        </button>

        {canGoBack && (
          <button
            onClick={onPrevious}
            className="previous-btn w-full flex items-center justify-center gap-2 py-3 text-[#999] font-montserrat font-semibold hover:text-[#DAA520] transition-all"
          >
            <span>←</span>
            <span>Previous</span>
          </button>
        )}
      </div>
    </div>
  );
}
;