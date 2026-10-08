import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import type { AboutData, ProjectData } from '@/core/types';
import { AboutDataSchema } from '@/core/schemas/about';
import { ProjectDataSchema } from '@/core/schemas/project';
import { db } from './client';

const ABOUT_COLLECTION = 'about';
const ABOUT_DOC_ID = 'main';
const PROJECTS_COLLECTION = 'projects';

export async function getAboutMe(): Promise<AboutData | null> {
  const snap = await getDoc(doc(db, ABOUT_COLLECTION, ABOUT_DOC_ID));
  if (!snap.exists()) return null;
  const parsed = AboutDataSchema.safeParse(snap.data());
  return (parsed.success ? parsed.data : snap.data()) as AboutData;
}

export async function saveAboutMe(data: AboutData): Promise<void> {
  await setDoc(doc(db, ABOUT_COLLECTION, ABOUT_DOC_ID), AboutDataSchema.parse(data));
}

function toProject(id: string, data: Record<string, unknown>): ProjectData {
  const raw = { id, ...data };
  const parsed = ProjectDataSchema.safeParse(raw);
  return (parsed.success ? parsed.data : raw) as ProjectData;
}

export async function listProjects(): Promise<ProjectData[]> {
  const snap = await getDocs(collection(db, PROJECTS_COLLECTION));
  return snap.docs.map((d) => toProject(d.id, d.data()));
}

export async function getProject(id: string): Promise<ProjectData | null> {
  const snap = await getDoc(doc(db, PROJECTS_COLLECTION, id));
  return snap.exists() ? toProject(id, snap.data()) : null;
}

export async function saveProject(id: string, data: ProjectData): Promise<void> {
  await setDoc(doc(db, PROJECTS_COLLECTION, id), ProjectDataSchema.parse({ ...data, id }));
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
}
