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
            {/* Meta */}
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div><span className="font-medium text-foreground">ID:</span> {data.id ?? '—'}</div>
                <div><span className="font-medium text-foreground">Created:</span> {data.createdAt || '—'}</div>
                {data.updatedAt && <div><span className="font-medium text-foreground">Updated:</span> {data.updatedAt}</div>}
              </div>
            </div>

            {/* Recommendation */}
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="font-semibold mb-3 text-foreground">Recommendation</h2>
              {data.recommendation ? (
                typeof (data.recommendation as any).text === 'string' ? (
                  <div className="prose prose-sm max-w-none text-foreground">
                    {(data.recommendation as any).text.split(/\n\n+/).map((para: string, i: number) => (
                      <p key={i} className="leading-relaxed">{para}</p>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-foreground space-y-2">
                    {Object.entries(data.recommendation).map(([k, v]) => (
                      <div key={k} className="flex items-start gap-2">
                        <div className="min-w-32 font-medium capitalize text-muted-foreground">{k.replace(/[_-]/g, ' ')}</div>
                        <div className="flex-1 break-words whitespace-pre-wrap">{typeof v === 'string' ? v : JSON.stringify(v, null, 2)}</div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-muted-foreground text-sm">No recommendation available.</div>
              )}
            </div>

            {/* Answers */}
            <div id="answers-reveal" className="border rounded-lg p-4 bg-card">
              <h2 className="font-semibold mb-3 text-foreground">Answers</h2>
              {data.answers && Object.keys(data.answers).length ? (
                <div className="text-sm text-foreground divide-y">
                  {Object.entries(data.answers).map(([k, v]) => (
                    <div key={k} className="py-2 flex items-start gap-3">
                      <div className="min-w-40 font-medium capitalize text-muted-foreground">{k.replace(/[_-]/g, ' ')}</div>
                      <div className="flex-1 break-words whitespace-pre-wrap">
                        {Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No answers captured.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

