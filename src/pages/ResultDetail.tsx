import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getQuizResultById } from '@/services/api/quiz.service';
import type { QuizResult } from '@/services/types/api.types';

export default function ResultDetail() {
  const { id } = useParams();
  const numericId = Number(id);

  const { data, isLoading, isError, refetch } = useQuery<QuizResult>({
    queryKey: ['quizResult', numericId],
    queryFn: () => getQuizResultById(numericId),
    enabled: Number.isFinite(numericId),
  });

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Result #{id}</h1>
          <Link to="/results" className="text-sm underline">Back to Results</Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded" />
            <div className="h-40 bg-muted rounded" />
          </div>
        ) : isError || !data ? (
          <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
            Failed to load this result. <button className="underline" onClick={() => refetch()}>Retry</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-2">Answers</h2>
              <pre className="text-sm whitespace-pre-wrap break-words">{JSON.stringify(data.answers, null, 2)}</pre>
            </div>
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-2">Recommendation</h2>
              {data.recommendation ? (
                <pre className="text-sm whitespace-pre-wrap break-words">{JSON.stringify(data.recommendation, null, 2)}</pre>
              ) : (
                <div className="text-muted-foreground text-sm">No recommendation available.</div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Created: {data.createdAt || '—'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
