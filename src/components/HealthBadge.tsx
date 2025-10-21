import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/services/api/health.service';

export default function HealthBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 60_000,
  });

  const status = isLoading ? 'checking' : isError ? 'down' : data?.status === 'ok' ? 'up' : 'unknown';
  const color = status === 'up' ? 'bg-green-500' : status === 'checking' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="fixed bottom-3 right-3 flex items-center gap-2 text-sm text-gray-700 bg-white/80 backdrop-blur border rounded-full px-3 py-1 shadow">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      <span>API: {status}</span>
    </div>
  );
}
