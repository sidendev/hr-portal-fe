import { z } from 'zod';

export const employeeSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email').optional(), // email optional since it's auto-generated
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    address: z.string().optional().nullable(),
});

export const contractSchema = z.object({
    employeeId: z.number().int().nonnegative(),
    contractType: z.string().min(1, 'Contract type is required'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
    endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
        .nullable()
        .optional(),
    fullTime: z.boolean(),
    hoursPerWeek: z.number().int().min(0).nullable().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type ContractFormValues = z.infer<typeof contractSchema>;
