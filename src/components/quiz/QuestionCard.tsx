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

  const handleAnswerChange = (answer: any) => {
    setLocalAnswer(answer);
    onAnswer(answer);
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'single':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options?.map((option, index) => {
              const selected = localAnswer === option;
              return (
                <div key={index} className="relative" onClick={() => handleAnswerChange(option)}>
                  <div
                    className={
                      `option-card flex items-center gap-5 p-6 bg-white rounded-2xl cursor-pointer transition-all duration-300 text-[1.05rem] border-2 ` +
                      (selected
                        ? 'selected border-[#DAA520] shadow-[0_10px_40px_rgba(218,165,32,0.12)]'
                        : 'border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[#DAA520] hover:translate-x-2')
                    }
                  >
                    <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${selected ? 'border-[#DAA520] bg-[linear-gradient(135deg,#DAA520,#f4d03f)]' : 'border-black/20 bg-white'}`}>
                      <span className={`text-white font-bold text-sm transition-all ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>✓</span>
                    </div>
                    <span className="option-text font-montserrat font-medium">{option}</span>
                    {selected && (
                      <div className="absolute right-6 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[16px]"
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
        );

      case 'multiple':
        return (
          <div className={`${(question.options?.length || 0) > 8 ? 'max-h-[500px] overflow-y-scroll pr-2 custom-scrollbar scrollbar-stable' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    `option-card flex items-center gap-5 p-6 bg-white rounded-2xl cursor-pointer transition-all duration-300 text-[1.05rem] border-2 ` +
                    (selected
                      ? 'selected border-[#DAA520] shadow-[0_10px_40px_rgba(218,165,32,0.12)]'
                      : 'border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[#DAA520] hover:translate-x-2')
                  }>
                    <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${selected ? 'border-[#DAA520] bg-[linear-gradient(135deg,#DAA520,#f4d03f)]' : 'border-black/20 bg-white'}`}>
                      <span className={`text-white font-bold text-sm transition-all ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>✓</span>
                    </div>
                    <span className="option-text font-montserrat font-medium">{option}</span>
                    {selected && (
                      <div className="absolute right-6 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[16px]"
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
          <div className="grid grid-cols-2 gap-4">
            {['Yes', 'No'].map((option) => {
              const selected = localAnswer === option;
              return (
                <div
                  key={option}
                  className={
                    `p-5 rounded-2xl border-2 text-center cursor-pointer transition-all ` +
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
      <div className="mb-6 md:mb-8">
        <h2 className="question-title-premium text-center" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', lineHeight: 1.2 }}>{question.title}</h2>
        {question.description && (
          <p className="text-[hsl(var(--gray-medium))] font-montserrat" style={{ fontSize: 'clamp(0.95rem, 2vw, 1rem)' }}>
            {question.description}
          </p>
        )}
      </div>

      <div className="mb-6 md:mb-8">
        {renderQuestionContent()}
      </div>

      <div className="space-y-4 mt-6 md:mt-10">
        <button
          onClick={onNext}
          disabled={!isAnswered}
          className="continue-btn w-full rounded-[60px] px-10 py-5 font-montserrat font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundImage: 'linear-gradient(135deg, #243BE3 0%, #4361ee 100%)', boxShadow: '0 15px 50px rgba(36,59,227,0.35)' }}
        >
          Continue →
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