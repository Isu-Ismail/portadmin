// One-time migration: rename every project image in Storage to <projectslug>_<4 random chars>.<ext>
// and rewrite the URLs in Firestore (projects/{id}.images and .certificate), keeping the same order.
//
//   node scripts/migrate-image-names.mjs            # dry run: prints the plan, changes nothing
//   node scripts/migrate-image-names.mjs --apply    # copy, update Firestore, then delete old files
//
// Auth: Application Default Credentials. Run once: gcloud auth application-default login
// (or set GOOGLE_APPLICATION_CREDENTIALS to a service-account key file).
//
// Safety order per project: copy all files -> update the Firestore document -> delete old files.
// If anything fails before the document update, old files and the old document are untouched.

import { randomBytes, randomUUID } from 'node:crypto';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const PROJECT_ID = 'portfolio-c1025';
const BUCKET = 'portfolio-c1025.firebasestorage.app';
const APPLY = process.argv.includes('--apply');
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID, storageBucket: BUCKET });
const db = getFirestore();
const bucket = getStorage().bucket();

const cleanId = (id) => (id || 'project').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
const suffix = () =>
  Array.from(randomBytes(4), (b) => CHARS[b % CHARS.length]).join('');

/** Storage object path from a Firebase download URL, or null when it is not one of ours. */
function pathFromUrl(url) {
  if (typeof url !== 'string' || !url.includes('/o/')) return null;
  try {
    return decodeURIComponent(url.split('/o/')[1].split('?')[0]);
  } catch {
    return null;
  }
}

function downloadUrl(path, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

async function tokenFor(file) {
  const [meta] = await file.getMetadata();
  const existing = meta.metadata?.firebaseStorageDownloadTokens;
  if (existing) return existing.split(',')[0];
  const token = randomUUID();
  await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
  return token;
}

async function migrateProject(docSnap) {
  const id = docSnap.id;
  const slug = cleanId(id);
  const data = docSnap.data();
  const folder = `projects/${id}/`;
  const alreadyNamed = new RegExp(`^${slug}_[A-Z0-9]{4}\\.[a-z0-9]+$`, 'i');

  const [existing] = await bucket.getFiles({ prefix: folder });
  const taken = new Set(existing.map((f) => f.name.slice(folder.length).toLowerCase()));

  // old object path -> new object path (shared when a URL is used twice)
  const plan = new Map();
  const planFor = (url) => {
    const path = pathFromUrl(url);
    if (!path || !path.startsWith(folder)) return null;
    const name = path.slice(folder.length);
    if (name.includes('/') || alreadyNamed.test(name)) return null;
    if (plan.has(path)) return plan.get(path);
    const ext = (name.split('.').pop() || 'webp').toLowerCase();
    let next;
    do next = `${slug}_${suffix()}.${ext}`;
    while (taken.has(next.toLowerCase()));
    taken.add(next.toLowerCase());
    const entry = { oldPath: path, newPath: `${folder}${next}`, newUrl: null };
    plan.set(path, entry);
    return entry;
  };

  const images = Array.isArray(data.images) ? data.images : [];
  images.forEach(planFor);
  if (data.certificate) planFor(data.certificate);

  if (plan.size === 0) {
    console.log(`  ${id}: nothing to rename`);
    return { renamed: 0 };
  }
  for (const e of plan.values()) {
    console.log(`  ${id}: ${e.oldPath.slice(folder.length)}  ->  ${e.newPath.slice(folder.length)}`);
  }
  if (!APPLY) return { renamed: plan.size };

  // 1) copy (custom metadata is preserved) and make sure each new file has a download token
  for (const e of plan.values()) {
    await bucket.file(e.oldPath).copy(bucket.file(e.newPath));
    e.newUrl = downloadUrl(e.newPath, await tokenFor(bucket.file(e.newPath)));
  }

  // 2) rewrite the document, same order
  const swap = (url) => {
    const path = pathFromUrl(url);
    return path && plan.has(path) ? plan.get(path).newUrl : url;
  };
  const update = { images: images.map(swap) };
  if (data.certificate) update.certificate = swap(data.certificate);
  await docSnap.ref.update(update);

  // 3) only now remove the old files
  for (const e of plan.values()) await bucket.file(e.oldPath).delete();
  return { renamed: plan.size };
}

console.log(APPLY ? 'APPLY mode: changing Storage and Firestore' : 'DRY RUN: nothing will be changed');
const snap = await db.collection('projects').get();
console.log(`Found ${snap.size} project(s)\n`);

let total = 0;
for (const docSnap of snap.docs) {
  try {
    total += (await migrateProject(docSnap)).renamed;
  } catch (err) {
    console.error(`  ${docSnap.id}: FAILED, left untouched -> ${err.message}`);
  }
}
console.log(`\n${APPLY ? 'Renamed' : 'Would rename'} ${total} file(s).${APPLY ? '' : ' Re-run with --apply to do it.'}`);
