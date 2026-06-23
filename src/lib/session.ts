/* ================================================================== *
 *  ACTIVE PRACTICE SESSION
 *  Remembers where you were in a deck (queue order + index + tally) so
 *  closing and reopening resumes at "12/16" instead of restarting.
 *  Kept separate from the synced CourseProgress (lib/progress.ts) on its
 *  own localStorage key so it never leaks into mastery/XP dashboards.
 * ================================================================== */

export interface PracticeSession {
  /** Scope this session belongs to, so we only resume the matching deck. */
  topic: string | null;
  mode: string | null; // "all" | "due" | null
  /** Ordered question ids — preserves the exact deck order on resume. */
  ids: string[];
  /** Current position in `ids`. */
  i: number;
  correct: number;
  wrong: number;
  updated: number;
}

const KEY = (courseId: string) => `polito:session:${courseId}`;

export function readSession(courseId: string): PracticeSession | null {
  try {
    const raw = localStorage.getItem(KEY(courseId));
    return raw ? (JSON.parse(raw) as PracticeSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(courseId: string, s: PracticeSession) {
  try {
    localStorage.setItem(KEY(courseId), JSON.stringify(s));
  } catch {
    /* storage full / unavailable */
  }
}

export function clearSession(courseId: string) {
  try {
    localStorage.removeItem(KEY(courseId));
  } catch {
    /* ignore */
  }
}
