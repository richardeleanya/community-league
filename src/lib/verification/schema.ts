import { z } from 'zod';

import type { VerificationDecisionValidation } from './types';

export const verificationDecisionSchema = z
  .object({
    actionId: z.string().uuid(),
    decision: z.enum([
      'approve_tier_1',
      'approve_tier_2',
      'approve_tier_3',
      'reject',
      'flag',
      'send_under_review',
    ]),
    moderatorNote: z.string().min(10).max(500),
    rejectionReason: z.string().min(10).max(500).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.decision === 'reject' && !value.rejectionReason) {
      context.addIssue({
        code: 'custom',
        path: ['rejectionReason'],
        message: 'A rejection reason is required when rejecting a community action.',
      });
    }
  });

export function validateVerificationDecisionDraft(input: unknown): VerificationDecisionValidation {
  const result = verificationDecisionSchema.safeParse(input);

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