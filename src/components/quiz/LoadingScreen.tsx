import React, { useEffect, useMemo, useState } from 'react';
import { QuizResponse } from './quizData';

export interface AnalysisPhase {
  duration: number;
  icon: string;
  title: string;
  items: string[];
  subtitle?: string;
  cta?: boolean;
}

export const loadingPhases: AnalysisPhase[] = [
  {
    duration: 900,
    icon: '🔍',
    title: 'Analyzing your responses...',
    items: [
      'Age range analyzed',
      'Hair loss timeline assessed',
      'Affected scalp areas mapped'
    ]
  },
  {
    duration: 900,
    icon: '🧬',
    title: 'Cross-referencing with trichology database...',
    items: [
      'Hormonal factors (postpartum, menopause)',
      'Traction indicators (tight styles, edges)',
      'Scalp health markers',
      'Genetic predisposition'
    ]
  },
  {
    duration: 900,
    icon: '🩺',
    title: 'Matching your symptoms to hair loss types...',
    items: [
      'Androgenic Alopecia indicators',
      'Traction Alopecia patterns',
      'Telogen Effluvium markers',
      'Scalp infection signs',
      'Nutritional deficiency signals'
    ]
  },
  {
    duration: 800,
    icon: '💎',
    title: 'Creating your personalized treatment plan...',
    items: [
      'Your specific hair loss type',
      'Affected areas (edges, crown, overall)',
      'Your lifestyle and habits',
      'Your hair goals'
    ]
  },
  {
    duration: 800,
    icon: '🌿',
    title: 'Matching you with targeted Fulani Hair Gro herbs...',
    items: [
      'Your diagnosed condition',
      'Scalp healing needs',
      'Follicle stimulation',
      'DHT blocking (if needed)',
      'Inflammation reduction'
    ]
  },
  {
    duration: 800,
    icon: '📊',
    title: 'Evaluating contributing factors...',
    items: [
      'Styling habits evaluated',
      'Product usage patterns',
      'Sleep and hair protection',
      'Family history factors'
    ]
  },
  {
    duration: 800,
    icon: '📋',
    title: 'Compiling your comprehensive report...',
    items: [
      'Diagnosis & hair loss type',
      'Contributing factors',
      'Treatment recommendations',
      'Product suggestions',
      'Lifestyle modifications'
    ]
  },
  {
    duration: 0,
    icon: '✅',
    title: 'Analysis Complete!',
    subtitle: "We've identified your specific hair loss pattern and created a personalized treatment plan just for you.",
    cta: true,
    items: []
  }
];

interface LoadingScreenProps {
  phase: number;
  responses: QuizResponse[];
  onViewResults: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ phase, responses: _responses, onViewResults }) => {
  const currentPhase = useMemo(() => loadingPhases[phase] ?? loadingPhases[0], [phase]);
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    setVisibleItems(0);
    if (currentPhase.items.length > 0 && currentPhase.duration > 0) {
      const itemDelay = Math.max(120, Math.floor(currentPhase.duration / currentPhase.items.length));
      const timers: number[] = [];
      currentPhase.items.forEach((_, index) => {
        const t = window.setTimeout(() => setVisibleItems(index + 1), itemDelay * index);
        timers.push(t);
      });
      return () => timers.forEach(clearTimeout);
    }
  }, [currentPhase]);

  return (
    <div className="analysis-screen">
      <div className="analysis-card">
        <div className="analysis-icon">{currentPhase.icon}</div>
        <h2 className="analysis-title">{currentPhase.title}</h2>
        {currentPhase.subtitle && (
          <p className="analysis-subtitle">{currentPhase.subtitle}</p>
        )}

        <div className="checklist">
          {currentPhase.items.map((item, index) => (
            <div key={index} className={`checklist-item ${index < visibleItems ? 'visible' : ''}`}>
              <span className="checkmark">✓</span>
              <span className="item-text">{item}</span>
            </div>
          ))}
        </div>

        {currentPhase.cta ? (
          <div className="cta-container">
            <button className="view-results-btn" onClick={onViewResults}>
              View Your Complete Hair Analysis
            </button>
            <p className="cta-subtext">
              This detailed report usually costs ₦15,000 at a trichology clinic.<br />
              <strong>You're getting it FREE today.</strong>
            </p>
          </div>
        ) : (
          <div className="gold-progress-bar">
            <div className="gold-progress-fill" />
          </div>
        )}
      </div>
    </div>
  );
};