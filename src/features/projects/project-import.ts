import { saveProject } from '@/core/firebase/firestore';
import { ProjectDataSchema } from '@/core/schemas/project';
import type { ProjectData } from '@/core/types';
import { validateWithSchema } from '@/core/utils/validation';

export const SAMPLE_PROJECT_JSON = JSON.stringify(
  {
    id: 'ai-vision-inspector',
    title: 'AI Vision Inspector',
    subtitle: 'Edge AI Computer Vision for Manufacturing Defect Detection',
    description: 'Real-time edge computer vision inspection system detecting micrometer-level production defects at line speed.',
    tags: ['Python', 'OpenCV', 'TensorFlow', 'FastAPI'],
    link: 'https://github.com/example/vision-inspector',
    status: 'Completed',
    duration: 'Jan 2024 - Apr 2024',
    stars: 5,
    architectureTitle: 'Edge Processing Pipeline',
    metrics: [
      { value: '<12ms', label: 'Inference Latency' },
      { value: '99.4%', label: 'Defect Accuracy' }
    ],
    techSpecs: [
      { label: 'Framework', value: 'PyTorch / TensorRT' },
      { label: 'Inference Engine', value: 'NVIDIA Jetson Orin' }
    ],
    architectureNodes: [
      { title: 'Camera Capture', desc: 'High FPS industrial GigE sensor stream', icon: 'Cpu' },
      { title: 'TensorRT Engine', desc: 'Quantized INT8 CNN detection pipeline', icon: 'Layers' }
    ],
    narratives: [
      {
        heading: 'Problem Statement',
        paragraphs: ['Manual optical inspection was causing an 8% throughput bottleneck on the assembly line.'],
        bullets: []
      }
    ],
    images: []
  },
  null,
  2
);

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Normalize a raw JSON object into a ProjectData payload. */
function toPayload(raw: Record<string, any>): ProjectData {
  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : raw.title
        ? slugify(String(raw.title))
        : `project-${Date.now()}`;

  return {
    id,
    title: String(raw.title || 'Untitled Project'),
    description: String(raw.description || ''),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    link: String(raw.link || ''),
    status: raw.status === 'In Progress' ? 'In Progress' : 'Completed',
    duration: String(raw.duration || ''),
    stars: typeof raw.stars === 'number' ? raw.stars : 5,
    subtitle: String(raw.subtitle || ''),
    architectureTitle: String(raw.architectureTitle || 'System Architecture'),
    metrics: Array.isArray(raw.metrics) ? raw.metrics : [],
    techSpecs: Array.isArray(raw.techSpecs) ? raw.techSpecs : [],
    architectureNodes: Array.isArray(raw.architectureNodes) ? raw.architectureNodes : [],
    narratives: Array.isArray(raw.narratives) ? raw.narratives : [],
    images: Array.isArray(raw.images) ? raw.images : [],
    certificate: String(raw.certificate || '')
  };
}

/**
 * Parse one project object or an array, validate each and save to Firestore.
 * Throws an Error with a user-readable message on failure.
 */
export async function importProjectsFromJson(text: string): Promise<ProjectData[]> {
  const parsed = JSON.parse(text.trim());
  const list = Array.isArray(parsed) ? parsed : [parsed];
  if (list.length === 0) throw new Error('Provided JSON array contains no items.');

  const saved: ProjectData[] = [];
  for (let i = 0; i < list.length; i++) {
    const raw = list[i];
    if (!raw || typeof raw !== 'object') throw new Error(`Item #${i + 1} is not a valid JSON object.`);
    const payload = toPayload(raw);
    const res = validateWithSchema(ProjectDataSchema, payload);
    if (!res.success) throw new Error(`Item #${i + 1} (${payload.title}): ${res.errorSummary}`);
    await saveProject(res.data.id, res.data as ProjectData);
    saved.push(res.data as ProjectData);
  }
  return saved;
}
