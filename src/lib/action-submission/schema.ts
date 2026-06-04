import { z } from 'zod';

import type { ActionSubmissionDraftInput, ActionSubmissionDraftValidation } from './types';

export const actionSubmissionActionTypes = [
  'litter_collection',
  'recycling_activity',
  'food_donation',
  'tree_planting',
  'volunteer_hour',
  'blood_donation',
  'event_leadership',
  'youth_mentoring',
  'elderly_assistance',
  'homeless_outreach',
  'playground_build',
  'park_restoration',
  'community_centre',
  'coaching_session',
] as const;

export const actionSubmissionCategories = [
  'environment',
  'social_care',
  'youth_development',
  'community_regeneration',
] as const;

export const actionSubmissionDraftSchema = z.object({
  actionType: z.enum(actionSubmissionActionTypes),
  actionCategory: z.enum(actionSubmissionCategories),
  missionId: z.string().uuid().nullable().optional(),
  description: z.string().min(50).max(500),
  photoUrls: z.array(z.string().url()).max(10),
  gpsLatitude: z.number().min(-90).max(90),
  gpsLongitude: z.number().min(-180).max(180),
  gpsAccuracyMetres: z.number().min(0).max(500),
  actionDate: z.string().min(10),
  volunteerHours: z.number().min(0).max(24).optional(),
  treesCount: z.number().int().min(0).optional(),
  foodItemsCount: z.number().int().min(0).optional(),
});

export function validateActionSubmissionDraft(input: unknown): ActionSubmissionDraftValidation {
  const result = actionSubmissionDraftSchema.safeParse(input);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      data: null,
    };
  }

  return {
    valid: true,
    errors: [],
    data: result.data satisfies ActionSubmissionDraftInput,
  };
}