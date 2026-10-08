import {
  deleteObject,
  getBlob,
  getDownloadURL,
  ref,
  uploadBytes
} from 'firebase/storage';
import { storage } from './client';

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  pdf: 'application/pdf'
};

function extOf(name: string, fallback: string): string {
  return name.split('.').pop()?.toLowerCase() || fallback;
}

function cleanId(projectId: string): string {
  return (projectId || 'project').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}

async function upload(path: string, file: File | Blob, ext: string): Promise<string> {
  const fileRef = ref(storage, path);
  const contentType = (file instanceof File ? file.type : '') || MIME_BY_EXT[ext] || 'image/webp';
  await uploadBytes(fileRef, file, { contentType });
  return getDownloadURL(fileRef);
}

export function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com') || url.startsWith('gs://');
}

/** Download via SDK; plain fetch() of a download URL can hit CORS errors. */
export async function downloadStorageBlob(urlOrPath: string): Promise<Blob> {
  return getBlob(ref(storage, urlOrPath));
}

// ---- About assets (clean, deterministic names) ----

export function uploadResumePdf(file: File | Blob, name = 'resume_pdf.pdf') {
  const ext = extOf(name, 'pdf');
  return upload(`about/resume_pdf.${ext}`, file, ext);
}

export function uploadResumeImage(file: File | Blob, name = 'resume_image.webp') {
  const ext = extOf(name, 'webp');
  return upload(`about/resume_image.${ext}`, file, ext);
}

export function uploadProfileImage(file: File | Blob, name = 'profile.webp') {
  const ext = extOf(name, 'webp');
  return upload(`about/profile.${ext}`, file, ext);
}

export function uploadAboutCertificate(index: number, file: File | Blob, name = 'certificate.webp') {
  const ext = extOf(name, 'webp');
  return upload(`about/certificate${index}.${ext}`, file, ext);
}

export function uploadExperienceCertificate(index: number, file: File | Blob, name = 'certificate.webp') {
  const ext = extOf(name, 'webp');
  return upload(`about/experience_certificate_${index}.${ext}`, file, ext);
}

// ---- Project assets ----
// Every project file is named `<projectslug>_<4 random chars>.<ext>` (e.g. cgpa_A2SD.webp).
// Names are never reused, so reordering/replacing never needs Storage renames.

const SUFFIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomSuffix(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => SUFFIX_CHARS[b % SUFFIX_CHARS.length]).join('');
}

/** Build a unique project file name. `taken` holds lower-cased names already in use (and is updated). */
export function newProjectFileName(projectId: string, ext: string, taken: Set<string> = new Set()): string {
  let name: string;
  do {
    name = `${cleanId(projectId)}_${randomSuffix()}.${ext}`;
  } while (taken.has(name.toLowerCase()));
  taken.add(name.toLowerCase());
  return name;
}

/** Upload a project image under a fresh random name. */
export function uploadProjectImage(
  projectId: string,
  file: File | Blob,
  originalName = 'image.webp',
  taken?: Set<string>
) {
  const ext = extOf(originalName, 'webp');
  const fileName = newProjectFileName(projectId, ext, taken);
  return upload(`projects/${cleanId(projectId)}/${fileName}`, file, ext);
}

export function uploadCertificateImage(projectId: string, file: File | Blob, name = 'certificate.webp') {
  return uploadProjectImage(projectId, file, name);
}

/** Best-effort delete of a Storage object by download URL or path. */
export async function deleteStorageFile(urlOrPath: string): Promise<void> {
  if (!urlOrPath) return;
  const isStorage =
    isFirebaseStorageUrl(urlOrPath) || urlOrPath.startsWith('about/') || urlOrPath.startsWith('projects/');
  if (!isStorage) return;
  try {
    await deleteObject(ref(storage, urlOrPath));
  } catch (err) {
    console.warn(`Could not delete storage file (${urlOrPath}):`, err);
  }
}
