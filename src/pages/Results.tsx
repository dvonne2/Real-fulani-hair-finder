import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listQuizResults } from '@/services/api/quiz.service';
import type { PaginatedQuizResults } from '@/services/types/api.types';

export default function Results() {
  const [params, setParams] = useSearchParams();
  const limit = Math.min(Number(params.get('limit') || 10), 100);
  const offset = Number(params.get('offset') || 0);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<PaginatedQuizResults>({
    queryKey: ['quizResults', { limit, offset }],
    queryFn: () => listQuizResults({ limit, offset }),
    staleTime: 5 * 60 * 1000,
  });

  const next = () => setParams({ limit: String(limit), offset: String(offset + limit) });
  const prev = () => setParams({ limit: String(limit), offset: String(Math.max(0, offset - limit)) });

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        ) : isError ? (
          <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
            Failed to load results. <button className="underline" onClick={() => refetch()}>Retry</button>
          </div>
        ) : !data || (data.items?.length ?? 0) === 0 ? (
          <div className="text-muted-foreground">No results yet.</div>
        ) : (
          <div className="space-y-2">
            {data.items?.map((r) => (
              <Link
                key={String(r.id) + (r.createdAt || '')}
                to={r.id ? `/results/${r.id}` : '/results'}
                className="block border rounded p-3 hover:bg-accent"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Result {r.id ?? 'pending'}</div>
                    <div className="text-sm text-muted-foreground">{r.createdAt || '—'}</div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate max-w-[50%]">
                    answers: {r.answers ? JSON.stringify(r.answers).slice(0, 80) : '—'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-6">
          <button className="btn" onClick={prev} disabled={offset === 0 || isFetching}>Prev</button>
          <button
            className="btn"
            onClick={next}
            disabled={(!!data && (data.items?.length ?? 0) < limit) || isFetching}
          >
            Next
          </button>
          <div className="text-sm text-muted-foreground ml-auto">Page {Math.floor(offset / limit) + 1}</div>
        </div>
      </div>
    </div>
  );
}
