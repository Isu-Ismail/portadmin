import {
  deleteObject,
  getBlob,
  getDownloadURL,
  ref,
  uploadBytes,
  type StorageReference
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

export function uploadProjectImage(
  projectId: string,
  file: File | Blob,
  position: number,
  name = 'image.webp',
  customFileName?: string
) {
  const ext = extOf(name, 'webp');
  const fileName = customFileName ? customFileName.trim() : `${position}.${ext}`;
  return upload(`projects/${cleanId(projectId)}/${fileName}`, file, ext);
}

export function uploadCertificateImage(projectId: string, file: File | Blob, name = 'certificate.webp') {
  const ext = extOf(name, 'webp');
  return upload(`projects/${cleanId(projectId)}/certificate.${ext}`, file, ext);
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

/** Re-number project carousel images sequentially (1.ext, 2.ext, ...). */
export async function renumberProjectImages(projectId: string, images: string[]): Promise<string[]> {
  const pending: Array<{ i: number; tempRef: StorageReference; ext: string }> = [];

  for (let i = 0; i < images.length; i++) {
    let oldRef: StorageReference;
    try {
      oldRef = ref(storage, images[i]);
    } catch {
      continue;
    }
    const ext = oldRef.name.split('.').pop() || 'png';
    if (oldRef.name === `${i + 1}.${ext}`) continue;

    const blob = await getBlob(oldRef);
    const tempRef = ref(storage, `projects/${projectId}/__tmp_${i}_${Date.now()}.${ext}`);
    await uploadBytes(tempRef, blob);
    await deleteObject(oldRef);
    pending.push({ i, tempRef, ext });
  }

  const result = [...images];
  for (const { i, tempRef, ext } of pending) {
    const blob = await getBlob(tempRef);
    const finalRef = ref(storage, `projects/${projectId}/${i + 1}.${ext}`);
    await uploadBytes(finalRef, blob);
    await deleteObject(tempRef);
    result[i] = await getDownloadURL(finalRef);
  }
  return result;
}
