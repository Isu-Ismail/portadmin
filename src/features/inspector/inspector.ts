export function fieldType(val: unknown): { badge: string; color: string } {
  if (val === null || val === undefined) return { badge: 'null', color: 'text-ink-3' };
  if (Array.isArray(val)) return { badge: `array [${val.length}]`, color: 'text-sky-400' };
  if (typeof val === 'object') return { badge: 'map', color: 'text-purple-400' };
  if (typeof val === 'number') return { badge: 'number', color: 'text-ok' };
  if (typeof val === 'boolean') return { badge: 'boolean', color: 'text-warn' };
  return { badge: 'string', color: 'text-orange' };
}

export function shortPreview(val: unknown): string {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'string') {
    if (!val) return '"" (empty string)';
    return val.length > 120 ? `"${val.slice(0, 115)}..."` : `"${val}"`;
  }
  if (Array.isArray(val)) {
    if (!val.length) return '[] (empty array)';
    if (typeof val[0] === 'string') return `[${val.slice(0, 4).join(', ')}${val.length > 4 ? ', ...' : ''}]`;
    return `[${val.length} item${val.length === 1 ? '' : 's'}]`;
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val as object);
    return `{ ${keys.slice(0, 4).join(', ')}${keys.length > 4 ? ', ...' : ''} }`;
  }
  return String(val);
}

export function fetchSnippet(collectionName: string, docId: string): string {
  const fn = collectionName === 'about' ? 'AboutMe' : 'Project';
  return `import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase'; // your initialized Firestore instance

// One-time read: ${collectionName}/${docId}
export async function fetch${fn}() {
  const snap = await getDoc(doc(db, '${collectionName}', '${docId}'));
  return snap.exists() ? snap.data() : null;
}

// Real-time listener
export function subscribeTo${fn}(callback) {
  return onSnapshot(doc(db, '${collectionName}', '${docId}'), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}
`;
}
