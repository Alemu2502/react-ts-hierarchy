import { z } from 'zod';

export const nodeSchema = z.object({
  name: z
    .string()
    .nonempty({ message: 'Name is required' }),

  description: z
    .string()
    .optional(),

  type: z
    .enum(['root', 'institute', 'school', 'department', 'teacher'], { required_error: 'Type is required' }),

  // Parent ID: Special handling for 'root' nodes
  parentId: z
    .preprocess(
      (val) => {
        if (val === '' || val === undefined) return null; 
        return Number(val);
      },
      z
        .union([
          z
            .number()
            .refine((val) => !isNaN(val), { message: 'Parent ID must be a number' })
            .nullable(),
          z.null(),
        ])
        .optional()
    )
    .refine(
      (val) => val === null || !isNaN(Number(val)),
      { message: 'Parent ID must be a number or null only for root' }
    ),
});
