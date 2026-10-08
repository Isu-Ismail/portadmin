export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  description: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
  certificateLink?: string;
}

export interface CertificateItem {
  title: string;
  image: string;
  desc: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  instagram: string;
}

export interface ProfileImages {
  profile: string;
  hero: string;
  resume_image: string;
}

export interface StatCardItem {
  value: string;
  label: string;
}

export interface AboutData {
  name: string;
  role: string;
  about: string;
  hero_about: string;
  resume: string;
  images: ProfileImages;
  contact: ContactInfo;
  skills: string[];
  interests: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  certificates: CertificateItem[];
  stats: StatCardItem[];
}

export interface MetricItem {
  value: string;
  label: string;
}

export interface TechSpecItem {
  label: string;
  value: string;
}

export interface ArchitectureNodeItem {
  icon: string;
  title: string;
  desc: string;
}

export interface NarrativeSection {
  heading: string;
  paragraphs: string[];
  bullets: string[];
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  status: string;
  duration: string;
  stars: number;
  subtitle?: string;
  architectureTitle?: string;
  metrics: MetricItem[];
  techSpecs: TechSpecItem[];
  architectureNodes: ArchitectureNodeItem[];
  narratives: NarrativeSection[];
  images: string[];
  certificate: string;
}

export type ImageFormat = 'image/webp' | 'image/jpeg' | 'image/png';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  quality: number; // 0.01 - 1.0
  format: ImageFormat;
  targetMaxSizeBytes?: number;
}

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  originalSizeBytes: number;
  outputWidth: number;
  outputHeight: number;
  outputSizeBytes: number;
  compressionRatio: number; // e.g. 0.35 = 65% reduction
  format: ImageFormat;
  fileName: string;
}
