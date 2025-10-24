import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

interface RootCause {
  type: string;
  confidence: number;
  priority: string;
  indicators: string[];
}

interface Product {
  name: string;
  reason: string;
  priority: string;
  frequency: string;
}

interface ProductCategoryType {
  category: string;
  products: Product[];
  criticalAction?: {
    title: string;
    details: string[];
  };
  medicalAdvice?: string;
}

interface ActionItem {
  action: string;
  why?: string;
  howTo?: string;
  tasks?: string[];
  milestone?: string;
  expect?: string[];
  phase?: string;
  actions?: string[];
}

interface QuizResults {
  submittedAt: string;
  riskLevel: string;
  urgency: string;
  patternType: string;
  specialNote: string;
  rootCauses: RootCause[];
  recommendations: ProductCategoryType[];
  actionPlan: {
    immediate: ActionItem[];
    week1: ActionItem[];
    month1: ActionItem[];
    month3: ActionItem[];
    maintenance: ActionItem[];
  };
  educationPriorities: any[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QuizResultsPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const [results, setResults] = useState<QuizResults | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  const toCamelResults = (row: any): QuizResults => {
    const actionPlan = row?.action_plan || row?.actionPlan || {};
    return {
      submittedAt: row?.createdAt || row?.submittedAt || '',
      riskLevel: row?.risk_level || row?.riskLevel || '',
      urgency: row?.urgency || '',
      patternType: row?.pattern_type || row?.patternType || '',
      specialNote: row?.special_note || row?.specialNote || '',
      rootCauses: row?.root_causes || row?.rootCauses || [],
      recommendations: row?.recommendations || [],
      actionPlan: {
        immediate: actionPlan?.immediate || [],
        week1: actionPlan?.week1 || [],
        month1: actionPlan?.month1 || [],
        month3: actionPlan?.month3 || [],
        maintenance: actionPlan?.maintenance || [],
      },
      educationPriorities: row?.education_priorities || row?.educationPriorities || [],
    };
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const [resultsResponse, productsResponse] = await Promise.all([
        axios.get(`/api/quiz/results/${submissionId}`),
        axios.get(`/api/products/recommendations/${submissionId}`)
      ]);

      // Normalize backend (snake_case) to camelCase used by UI
      const payload = resultsResponse.data?.results || resultsResponse.data;
      const normalized = toCamelResults(payload);
      setResults(normalized);
      setProducts(productsResponse.data?.products || []);

      if ((window as any).gtag) {
        (window as any).gtag('event', 'results_viewed', {
          submission_id: submissionId,
          risk_level: normalized?.riskLevel,
          primary_cause: normalized?.rootCauses?.[0]?.type
        });
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch results:', err);
      setError(err?.response?.data?.error || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !results) {
    return <ErrorState error={error} onRetry={fetchResults} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FULANI HAIR GRO
            </h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Risk Badge */}
        <RiskBadge level={results.riskLevel} urgency={results.urgency} />

        {/* Special Note */}
        {results.specialNote && <SpecialNote message={results.specialNote} />}

        {/* Root Causes */}
        {Array.isArray(results.rootCauses) && results.rootCauses.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              What's Causing Your Hair Loss
            </h2>
            <div className="space-y-4">
              {results.rootCauses.map((cause, index) => (
                <CauseCard
                  key={index}
                  rank={index + 1}
                  cause={cause}
                  isPrimary={index === 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* Product Recommendations */}
        {Array.isArray(results.recommendations) && results.recommendations.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Your Personalized Treatment Plan
            </h2>
            <div className="space-y-6">
              {results.recommendations.map((category, index) => (
                <ProductCategory
                  key={index}
                  category={category}
                  products={products}
                  submissionId={submissionId!}
                />
              ))}
            </div>
          </section>
        )}

        {/* Action Plan */}
        {results.actionPlan && (
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Your 90-Day Action Plan
            </h2>
            <ActionTimeline plan={results.actionPlan} />
          </section>
        )}

        {/* Educational Content */}
        {Array.isArray(results.educationPriorities) && results.educationPriorities.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Learn More About Your Situation
            </h2>
            <EducationPriorities priorities={results.educationPriorities} />
          </section>
        )}

        {/* CTA Footer */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Start Your Hair Recovery Journey?
          </h3>
          <p className="mb-6 text-purple-100">
            Get your recommended products delivered to your door
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-white text-purple-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Shop Recommended Products →
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
    <h2 className="text-2xl font-bold text-gray-800">Loading Your Results...</h2>
  </div>
);

const ErrorState: React.FC<{ error: string | null; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
      <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Results</h2>
      <p className="text-red-600 mb-4">{error || 'Something went wrong'}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  </div>
);

const RiskBadge: React.FC<{ level: string; urgency: string }> = ({ level, urgency }) => {
  const colors: any = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className={`${colors[level]} text-white rounded-2xl p-6 text-center`}>
      <h3 className="text-3xl font-bold mb-2">
        {String(level || '').toUpperCase()} RISK
      </h3>
      <p className="text-xl">Urgency: {urgency}</p>
    </div>
  );
};

const SpecialNote: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">
          💬 Personal Message
        </h3>
        <p className="text-yellow-700 leading-relaxed">{message}</p>
      </div>
    </div>
  </div>
);

const CauseCard: React.FC<{ rank: number; cause: RootCause; isPrimary: boolean }> = ({
  rank,
  cause,
  isPrimary
}) => {
  const priorityColors: any = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-gray-300 bg-gray-50'
  };

  return (
    <div className={`border-l-4 ${priorityColors[cause.priority]} rounded-r-lg p-6 ${isPrimary ? 'shadow-lg' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-400">#{rank}</span>
          <h3 className="text-xl font-bold text-gray-800">
            {String(cause.type || '').replace('_', ' ').toUpperCase()}
          </h3>
          {isPrimary && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
              PRIMARY
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-gray-600">
          {Number.isFinite(cause.confidence) ? `${cause.confidence}% confident` : ''}
        </span>
      </div>

      {Array.isArray(cause.indicators) && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">Why we think this:</h4>
          <ul className="space-y-1">
            {cause.indicators.map((indicator, idx) => (
              <li key={idx} className="flex items-start text-gray-600">
                <span className="text-purple-600 mr-2">•</span>
                <span>{indicator}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className="text-sm font-semibold text-gray-700">
          Priority: <span className="text-purple-600">{String(cause.priority || '').toUpperCase()}</span>
        </span>
      </div>
    </div>
  );
};

const ProductCategory: React.FC<{ category: ProductCategoryType; products: any[]; submissionId: string }> = ({ category, products, submissionId }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        {category.category}
      </h3>

      {category.criticalAction && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-red-800 mb-2">
            🚨 {category.criticalAction.title}
          </h4>
          <ul className="space-y-1">
            {category.criticalAction.details.map((detail: string, idx: number) => (
              <li key={idx} className="text-red-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.products.map((product: Product, idx: number) => (
          <ProductCard key={idx} product={product} submissionId={submissionId} />
        ))}
      </div>

      {category.medicalAdvice && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <span className="font-semibold">⚕️ Medical Advice:</span> {category.medicalAdvice}
          </p>
        </div>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; submissionId: string }> = ({ product, submissionId }) => {
  const priorityColors: any = {
    essential: 'border-red-500',
    highly_recommended: 'border-orange-500',
    recommended: 'border-blue-500',
    optional: 'border-gray-300'
  };

  const priorityBadges: any = {
    essential: 'bg-red-600 text-white',
    highly_recommended: 'bg-orange-600 text-white',
    recommended: 'bg-blue-600 text-white',
    optional: 'bg-gray-400 text-white'
  };

  const handleAddToCart = () => {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'product_added_to_cart', {
        submission_id: submissionId,
        product_name: product.name,
        priority: product.priority
      });
    }
    // Hook your cart logic here
    // eslint-disable-next-line no-console
    console.log('Adding to cart:', product);
  };

  return (
    <div className={`border-2 ${priorityColors[product.priority]} rounded-lg p-4 hover:shadow-lg transition-shadow`}>
      <span className={`text-xs px-2 py-1 rounded-full ${priorityBadges[product.priority]}`}>
        {String(product.priority || '').replace('_', ' ').toUpperCase()}
      </span>

      <h4 className="font-bold text-gray-800 mt-3 mb-2">
        {product.name}
      </h4>

      <p className="text-sm text-gray-600 mb-2">
        {product.reason}
      </p>

      <p className="text-xs text-gray-500 mb-4">
        <span className="font-semibold">Use:</span> {product.frequency}
      </p>

      <button
        onClick={handleAddToCart}
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
      >
        Add to Cart
      </button>
    </div>
  );
};

const ActionTimeline: React.FC<{ plan: any }> = ({ plan }) => {
  const sections = [
    { key: 'immediate', title: 'This Week', color: 'red' },
    { key: 'week1', title: 'Week 1', color: 'orange' },
    { key: 'month1', title: 'Month 1', color: 'yellow' },
    { key: 'month3', title: 'Month 3', color: 'green' },
    { key: 'maintenance', title: 'Long-term', color: 'blue' }
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <TimelineSection
          key={section.key}
          title={section.title}
          items={plan[section.key]}
          color={section.color}
        />
      ))}
    </div>
  );
};

const TimelineSection: React.FC<{ title: string; items: ActionItem[]; color: string }> = ({ title, items, color }) => {
  const colorClasses: any = {
    red: 'bg-red-100 border-red-500 text-red-800',
    orange: 'bg-orange-100 border-orange-500 text-orange-800',
    yellow: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    green: 'bg-green-100 border-green-500 text-green-800',
    blue: 'bg-blue-100 border-blue-500 text-blue-800'
  };

  return (
    <div className={`border-l-4 ${colorClasses[color]} rounded-r-lg p-6`}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-3">
        {Array.isArray(items) && items.map((item: ActionItem, idx: number) => (
          <div key={idx}>
            {item.action && (
              <div>
                <p className="font-semibold">{item.action}</p>
                {item.why && <p className="text-sm mt-1">→ {item.why}</p>}
                {item.howTo && <p className="text-sm mt-1 italic">How: {item.howTo}</p>}
              </div>
            )}
            {Array.isArray(item.tasks) && (
              <ul className="space-y-1 mt-2">
                {item.tasks.map((task: string, taskIdx: number) => (
                  <li key={taskIdx} className="flex items-start text-sm">
                    <span className="mr-2">□</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EducationPriorities: React.FC<{ priorities: any[] }> = ({ priorities }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {priorities.map((edu, idx) => (
      <div key={idx} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-2">{edu.title}</h3>
        {edu.urgency && (
          <p className="text-sm text-purple-600 mb-3">{edu.urgency}</p>
        )}
        <ul className="space-y-1">
          {Array.isArray(edu.topics) && edu.topics.map((topic: string, topicIdx: number) => (
            <li key={topicIdx} className="text-sm text-gray-600 flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>{topic}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export default QuizResultsPage;
