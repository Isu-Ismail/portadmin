import { z } from 'zod';
import { optionalUrl, optionalEmail } from './common';

export const EducationItemSchema = z.object({
  degree: z.string().trim().min(1, 'Degree is required'),
  institution: z.string().trim().min(1, 'Institution is required'),
  period: z.string().trim().min(1, 'Period is required (e.g. 2020 — 2024)'),
  description: z.string().default('')
});

export const ExperienceItemSchema = z.object({
  role: z.string().trim().min(1, 'Role / Job Title is required'),
  company: z.string().trim().min(1, 'Company / Organization is required'),
  period: z.string().trim().min(1, 'Period is required (e.g. 2022 — Present)'),
  description: z.string().default(''),
  certificateLink: optionalUrl.default('')
});

export const CertificateItemSchema = z.object({
  title: z.string().trim().min(1, 'Certificate title is required'),
  image: z.string().default(''),
  desc: z.string().default('')
});

export const StatCardItemSchema = z.object({
  value: z.string().trim().min(1, 'Value is required (e.g. Entry, 11+, 4+)'),
  label: z.string().trim().min(1, 'Label is required (e.g. Talent Ready, Projects Completed)')
});

export const ContactInfoSchema = z.object({
  email: optionalEmail.default(''),
  phone: z.string().trim().default(''),
  location: z.string().trim().default(''),
  github: z.string().trim().default(''),
  linkedin: z.string().trim().default(''),
  instagram: z.string().trim().default('')
});

export const ProfileImagesSchema = z.object({
  profile: z.string().default(''),
  hero: z.string().default(''),
  resume_image: z.string().default('')
});

export const AboutDataSchema = z.object({
  name: z.string().trim().min(1, 'Full name is required (at least 1 character)'),
  role: z.string().trim().min(1, 'Primary title / role is required'),
  about: z.string().trim().default(''),
  hero_about: z.string().trim().default(''),
  resume: z.string().default(''),
  images: ProfileImagesSchema.default({ profile: '', hero: '', resume_image: '' }),
  contact: ContactInfoSchema.default({
    email: '',
    phone: '',
    location: '',
    github: '',
    linkedin: '',
    instagram: ''
  }),
  skills: z.array(z.string().trim()).default([]),
  interests: z.array(z.string().trim()).default([]),
  education: z.array(EducationItemSchema).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  certificates: z.array(CertificateItemSchema).default([]),
  stats: z.array(StatCardItemSchema).default([
    { value: 'Entry', label: 'Talent Ready' },
    { value: '11+', label: 'Projects Completed' }
  ])
});
