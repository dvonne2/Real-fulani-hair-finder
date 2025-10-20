export type SaveQuizResultPayload = {
  answers: any;
  recommendation?: any;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  state?: string | null;
};

const API_BASE = 'http://localhost:8000';

export async function saveQuizResult(payload: SaveQuizResultPayload) {
  try {
    const res = await fetch(`${API_BASE}/quiz-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // Do not throw to avoid blocking UX; just return info
      const text = await res.text();
      return { ok: false, status: res.status, body: text };
    }
    const body = await res.json();
    return { ok: true, status: res.status, body };
  } catch (e: any) {
    // Swallow network errors for now; could toast if desired
    return { ok: false, status: 0, body: String(e?.message || e) };
  }
}
