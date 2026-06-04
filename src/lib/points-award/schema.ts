import { z } from 'zod';

import type { PointsAwardDecisionValidation } from './types';

export const pointsAwardDecisionSchema = z.object({
  actionId: z.string().uuid(),
  approvalStatus: z.enum(['tier1_approved', 'tier2_approved', 'tier3_approved']),
  verifiedBy: z.string().uuid(),
  note: z.string().min(10).max(500),
});

export function validatePointsAwardDecisionDraft(input: unknown): PointsAwardDecisionValidation {
  const result = pointsAwardDecisionSchema.safeParse(input);

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
    data: result.data,
  };
}