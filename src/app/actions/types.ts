import { z } from "zod";

export const EMISchema = z.object({
  emiName: z.string().min(1, "EMI name is required"),
  totalAmount: z
    .number()
    .int()
    .positive("Total amount must be a positive integer"),
  amountPaid: z
    .number()
    .int()
    .min(0, "Amount paid must be a non-negative integer"),
  monthlyEmiAmount: z
    .number()
    .int()
    .positive("Monthly EMI amount must be a positive integer"),
  monthlyDueDate: z
    .number()
    .int()
    .min(1)
    .max(31, "Monthly due date must be between 1 and 31"),
  startDate: z.string(),
  endDate: z.string(),
  interestRate: z
    .number()
    .min(0)
    .max(100, "Interest rate must be between 0 and 100"),
});

export type EMISchemaType = z.infer<typeof EMISchema>;

export interface EMI {
  id: number;
  userId: string;
  emiName: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyEmiAmount: number;
  monthlyDueDate: number;
  startDate: Date;
  endDate: Date;
  interestRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
