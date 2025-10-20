import { QuizContainer } from '@/components/quiz/QuizContainer';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Quiz = () => {
  const navigate = useNavigate();
  
  // Detect restart synchronously so QuizContainer sees it on first render
  const restartNow = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('restart') === '1';
  if (restartNow) {
    try { localStorage.removeItem('fulani-hair-quiz'); } catch {}
  }
  // Clean the URL after mount
  useEffect(() => {
    if (restartNow) {
      const url = new URL(window.location.href);
      url.searchParams.delete('restart');
      window.history.replaceState({}, '', url.pathname + (url.search ? '?' + url.searchParams.toString() : ''));
    }
  }, [restartNow]);
  
  return (
    <div className="min-h-screen bg-white">
      <QuizContainer ignoreSaved={restartNow} />
    </div>
  );
};

export default Quiz;
