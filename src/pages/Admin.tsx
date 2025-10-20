import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { quizQuestions, type Question } from '@/components/quiz/quizData';

type QuizResult = {
  id: number | null;
  answers: any;
  recommendation?: any;
  createdAt?: string;
  updatedAt?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  state?: string | null;
};

const API_BASE = 'http://localhost:8000';

function toDateISO(d?: string) {
  try { return d ? new Date(d).toISOString().slice(0,10) : ''; } catch { return ''; }
}

function indexAnswers(item: QuizResult): Record<string, any> {
  const map: Record<string, any> = {};
  const arr = Array.isArray(item?.answers) ? item.answers : [];
  for (const r of arr) {
    if (r && typeof r === 'object' && r.questionId) {
      map[String(r.questionId)] = r.answer;
    }
  }
  return map;
}

function getAnswersList(item: QuizResult, key: string): string[] {
  const found = Array.isArray(item?.answers)
    ? item.answers.find((r: any) => r?.questionId === key)?.answer
    : undefined;
  if (!found) return [];
  return Array.isArray(found) ? found : [String(found)];
}

function getRecommendationText(item: QuizResult): string {
  const r = item?.recommendation;
  if (!r) return '';
  if (typeof r === 'string') return r;
  if (typeof r?.text === 'string') return r.text;
  return JSON.stringify(r);
}

export default function Admin() {
  const [items, setItems] = useState<QuizResult[]>([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<QuizResult | null>(null);

  // Insert hardcoded demo leads (client-side helper hitting backend POST)
  async function insertDemo(count = 5) {
    setLoading(true);
    try {
      for (let i = 0; i < count; i++) {
        const payload = {
          answers: [
            { questionId: 'hair-goals', answer: i % 2 === 0 ? ['Hair growth', 'Build stronger, healthier strands'] : ['Reduce hair breakage/shedding'] },
            { questionId: 'current-challenges', answer: i % 3 === 0 ? 'My edges are thinning or breaking' : 'My hair breaks easily when I comb or style it' },
            { questionId: 'hair-texture', answer: i % 2 === 0 ? 'Type 4C (Kinky - tight coils, minimal curl pattern)' : 'Type 4B (Coily - Z-pattern, less defined curls)' },
            { questionId: 'hair-care-routine', answer: ['I wash my hair weekly','I deep condition regularly','I use leave-in conditioner'].slice(0, (i%3)+1) },
            { questionId: 'stress-levels', answer: ['Moderate stress, manageable daily pressures','High stress, frequently feeling pressured'][i%2] },
          ],
          recommendation: { text: `Based on your answers, focus on a gentle routine, protective styling cadence, and our Growth & Nutrient bundle. (demo ${i+1})` },
          name: `Demo Lead ${i+1}`,
          email: `lead${i+1}@example.com`,
          phone: `080${Math.floor(10000000 + Math.random()*89999999)}`,
          state: i % 2 === 0 ? 'Lagos' : 'Abuja',
        };
        await fetch(`${API_BASE}/quiz-results`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/quiz-results?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => { void load(); }, 30000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // Build dynamic option lists from current items
  const allGoals = useMemo(() => {
    const s = new Set<string>();
    items.forEach(it => getAnswersList(it, 'hair-goals').forEach((g) => s.add(g)));
    return Array.from(s).sort();
  }, [items]);

  const allChallenges = useMemo(() => {
    const s = new Set<string>();
    items.forEach(it => getAnswersList(it, 'current-challenges').forEach((c) => s.add(c)));
    return Array.from(s).sort();
  }, [items]);

  // Apply filters client-side
  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null;
    return items.filter((it) => {
      const created = it.createdAt ? new Date(it.createdAt) : null;
      if (from && created && created < from) return false;
      if (to && created && created > to) return false;
      const goals = getAnswersList(it, 'hair-goals');
      const challenges = getAnswersList(it, 'current-challenges');
      if (selectedGoals.length && !selectedGoals.some(g => goals.includes(g))) return false;
      if (selectedChallenges.length && !selectedChallenges.some(c => challenges.includes(c))) return false;
      return true;
    });
  }, [items, dateFrom, dateTo, selectedGoals, selectedChallenges]);

  // KPIs
  const kpi = useMemo(() => {
    const now = Date.now();
    const ms7 = 7*24*60*60*1000;
    const ms30 = 30*24*60*60*1000;
    const inLast = (ms: number) => filtered.filter(it => it.createdAt && (now - new Date(it.createdAt!).getTime()) <= ms).length;
    const total = filtered.length;
    const last7 = inLast(ms7);
    const last30 = inLast(ms30);
    const hasGoalGrowth = filtered.filter(it => getAnswersList(it, 'hair-goals').some(v => /growth/i.test(v))).length;
    const hasEdgesThinning = filtered.filter(it => getAnswersList(it, 'current-challenges').some(v => /edge|edges|thinning/i.test(v))).length;
    const pct = (n: number) => total ? Math.round((n/total)*100) : 0;
    return { total, last7, last30, pctGrowth: pct(hasGoalGrowth), pctEdges: pct(hasEdgesThinning) };
  }, [filtered]);

  function resetFilters() {
    setDateFrom('');
    setDateTo('');
    setSelectedGoals([]);
    setSelectedChallenges([]);
  }

  function openDetail(it: QuizResult) {
    setDetailItem(it);
    setDetailOpen(true);
  }

  function copySummary(it: QuizResult) {
    const goals = getAnswersList(it, 'hair-goals').join(', ');
    const challenges = getAnswersList(it, 'current-challenges').join(', ');
    const summary = `Lead summary\nID: ${it.id ?? '—'}\nCreated: ${it.createdAt ? new Date(it.createdAt).toLocaleString() : '—'}\nGoals: ${goals}\nChallenges: ${challenges}\nRecommendation: ${getRecommendationText(it)}`;
    navigator.clipboard?.writeText(summary);
  }

  function replaceAllPolyfill(str: string, find: string, replacement: string) {
    return String(str).split(find).join(replacement);
  }

  function exportCsv(rows: QuizResult[]) {
    const headers = ['id','createdAt','goals','challenges','recommendation'];
    const lines = rows.map(r => {
      const goals = getAnswersList(r, 'hair-goals').join('|');
      const challenges = getAnswersList(r, 'current-challenges').join('|');
      const rec = replaceAllPolyfill(
        replaceAllPolyfill(getRecommendationText(r), '\n', ' '),
        '"', '""'
      );
      return [r.id ?? '', r.createdAt ?? '', goals, challenges, rec].map(v => `"${String(v ?? '')}"`).join(',');
    });
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">Admin · Quiz Results</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              Auto-refresh (30s)
            </label>
            <Button variant="outline" onClick={() => void load()} disabled={loading}>Refresh</Button>
            <Button variant="secondary" onClick={() => void insertDemo(5)} disabled={loading}>Insert demo leads</Button>
            <Button onClick={() => exportCsv(filtered)} disabled={!filtered.length}>Export CSV</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4"><div className="text-sm text-muted-foreground">Total (filtered)</div><div className="text-2xl font-bold">{kpi.total}</div></Card>
          <Card className="p-4"><div className="text-sm text-muted-foreground">Last 7 days</div><div className="text-2xl font-bold">{kpi.last7}</div></Card>
          <Card className="p-4"><div className="text-sm text-muted-foreground">Last 30 days</div><div className="text-2xl font-bold">{kpi.last30}</div></Card>
          <Card className="p-4"><div className="text-sm text-muted-foreground">Growth / Edges</div><div className="text-2xl font-bold">{kpi.pctGrowth}% / {kpi.pctEdges}%</div></Card>
        </div>

        {/* Controls */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From</span>
              <input type="date" className="border rounded px-2 py-1 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To</span>
              <input type="date" className="border rounded px-2 py-1 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Goals</span>
              <select multiple className="border rounded px-2 py-1 text-sm min-w-[12rem]" value={selectedGoals} onChange={(e) => setSelectedGoals(Array.from(e.target.selectedOptions).map(o => o.value))}>
                {allGoals.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Challenges</span>
              <select multiple className="border rounded px-2 py-1 text-sm min-w-[12rem]" value={selectedChallenges} onChange={(e) => setSelectedChallenges(Array.from(e.target.selectedOptions).map(o => o.value))}>
                {allChallenges.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button variant="secondary" onClick={resetFilters}>Reset</Button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page size</span>
              <select className="border rounded px-2 py-1 text-sm" value={limit} onChange={(e)=> setLimit(Number(e.target.value))}>
                {[20,50,100].map(n=> <option key={n} value={n}>{n}</option>)}
              </select>
              <Button variant="outline" onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset===0 || loading}>Prev</Button>
              <Button variant="outline" onClick={() => setOffset(offset + limit)} disabled={loading}>Next</Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Created</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Phone</th>
                  <th className="py-2 px-3">State</th>
                  <th className="py-2 px-3">Goals</th>
                  <th className="py-2 px-3">Challenges</th>
                  <th className="py-2 px-3">Recommendation</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="py-4 px-3" colSpan={6}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="py-4 px-3" colSpan={6}>No results match your filters</td></tr>
                ) : (
                  filtered.map((it) => {
                    const goals = getAnswersList(it, 'hair-goals');
                    const challenges = getAnswersList(it, 'current-challenges');
                    const rec = getRecommendationText(it);
                    return (
                      <tr key={`${it.id}-${it.createdAt}`} className="border-b align-top">
                        <td className="py-2 px-3">{it.id ?? '—'}</td>
                        <td className="py-2 px-3">{it.createdAt ? new Date(it.createdAt).toLocaleString() : '—'}</td>
                        <td className="py-2 px-3">{it.name ?? '—'}</td>
                        <td className="py-2 px-3">{it.email ?? '—'}</td>
                        <td className="py-2 px-3">{it.phone ?? '—'}</td>
                        <td className="py-2 px-3">{it.state ?? '—'}</td>
                        <td className="py-2 px-3 whitespace-pre-wrap max-w-[18rem]">{goals.join(', ')}</td>
                        <td className="py-2 px-3 whitespace-pre-wrap max-w-[18rem]">{challenges.join(', ')}</td>
                        <td className="py-2 px-3 whitespace-pre-wrap max-w-[22rem]">{rec.slice(0,140)}{rec.length>140?'…':''}</td>
                        <td className="py-2 px-3">
                          <Button size="sm" variant="outline" onClick={()=>openDetail(it)}>View</Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail Drawer */}
        <Drawer open={detailOpen} onOpenChange={setDetailOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Result detail</DrawerTitle>
            </DrawerHeader>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-auto">
              {detailItem && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">ID</div>
                      <div className="font-medium">{detailItem.id ?? '—'}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">Created</div>
                      <div className="font-medium">{detailItem.createdAt ? new Date(detailItem.createdAt).toLocaleString() : '—'}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium">{detailItem.name ?? '—'}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium break-all">{detailItem.email ?? '—'}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{detailItem.phone ?? '—'}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">State</div>
                      <div className="font-medium">{detailItem.state ?? '—'}</div>
                    </Card>
                  </div>
                  <Card className="p-4">
                    <div className="font-semibold mb-2">Summary</div>
                    <div className="text-sm whitespace-pre-wrap">
                      Goals: {getAnswersList(detailItem, 'hair-goals').join(', ') || '—'}\n
                      Challenges: {getAnswersList(detailItem, 'current-challenges').join(', ') || '—'}\n
                      Recommendation: {getRecommendationText(detailItem) || '—'}
                    </div>
                    <div className="mt-3">
                      <Button size="sm" onClick={()=>copySummary(detailItem)}>Copy summary</Button>
                    </div>
                  </Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 overflow-auto">
                      <div className="font-semibold mb-2">Answers (raw)</div>
                      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(detailItem.answers, null, 2)}</pre>
                    </Card>
                    <Card className="p-4 overflow-auto">
                      <div className="font-semibold mb-2">Recommendation (raw)</div>
                      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(detailItem.recommendation ?? null, null, 2)}</pre>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <div className="font-semibold mb-3">Full Q&A (human-readable)</div>
                    <div className="space-y-3">
                      {(() => {
                        const idx = indexAnswers(detailItem);
                        return quizQuestions.map((q: Question) => {
                          const val = idx[q.id];
                          const pretty = Array.isArray(val) ? val.join(', ') : (val ?? '—');
                          return (
                            <div key={q.id} className="border-b last:border-0 pb-2">
                              <div className="text-sm text-muted-foreground">{q.title}</div>
                              <div className="font-medium">{String(pretty)}</div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </Card>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
