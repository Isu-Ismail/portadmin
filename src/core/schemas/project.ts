import { z } from 'zod';
import { optionalUrl } from './common';

export const MetricItemSchema = z.object({
  value: z.string().trim().default(''),
  label: z.string().trim().default('')
});

export const TechSpecItemSchema = z.object({
  label: z.string().trim().default(''),
  value: z.string().trim().default('')
});

export const ArchitectureNodeItemSchema = z.object({
  icon: z.string().trim().default('server'),
  title: z.string().trim().default(''),
  desc: z.string().trim().default('')
});

export const NarrativeSectionSchema = z.object({
  heading: z.string().trim().default(''),
  paragraphs: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([])
});

export const ProjectDataSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, 'Project ID / slug is required')
    .max(64, 'ID must be 64 characters or less')
    .regex(
      /^[a-z0-9-_]+$/,
      'ID must be lowercase alphanumeric characters, hyphens or underscores (e.g. my-project-1)'
    ),
  title: z.string().trim().min(1, 'Project title is required'),
  description: z.string().trim().default(''),
  tags: z.array(z.string().trim()).default([]),
  link: optionalUrl.default(''),
  status: z.string().trim().default('Completed'),
  duration: z.string().trim().default(''),
  stars: z.number().int().min(1, 'Stars must be at least 1').max(5, 'Stars cannot exceed 5').default(5),
  subtitle: z.string().trim().optional().default(''),
  architectureTitle: z.string().trim().optional().default(''),
  metrics: z.array(MetricItemSchema).optional().default([]),
  techSpecs: z.array(TechSpecItemSchema).optional().default([]),
  architectureNodes: z.array(ArchitectureNodeItemSchema).optional().default([]),
  narratives: z.array(NarrativeSectionSchema).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  certificate: z.string().optional().default(''),
  detailsLink: optionalUrl.default('')
});
