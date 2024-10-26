"use server";

import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../../../drizzle/db";
import { EMITable } from "../../../drizzle/schema";

const EMISchema = z.object({
  emiName: z.string().min(1, "EMI name is required"),
  totalAmount: z.number().positive("Total amount must be a positive number"),
  amountPaid: z.number().min(0, "Amount paid must be a non-negative number"),
  monthlyEmiAmount: z
    .number()
    .positive("Monthly EMI amount must be a positive number"),
  monthlyDueDate: z
    .number()
    .int()
    .min(1)
    .max(31, "Monthly due date must be between 1 and 31"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  interestRate: z
    .number()
    .min(0)
    .max(100, "Interest rate must be between 0 and 100")
    .transform((val) => Number(val.toFixed(2))),
  isActive: z.boolean().default(true),
});

export const saveEMI = authActionClient
  .metadata({ actionName: "saveEMI" })
  .schema(EMISchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const remainingAmount = parsedInput.totalAmount - parsedInput.amountPaid;

    if (remainingAmount < 0) {
      throw new Error("Amount paid cannot be greater than total amount");
    }

    const isActive = remainingAmount > 0;

    const insertValues = {
      userId,
      emiName: parsedInput.emiName,
      totalAmount: parsedInput.totalAmount.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2),
      monthlyEmiAmount: parsedInput.monthlyEmiAmount.toFixed(2),
      monthlyDueDate: parsedInput.monthlyDueDate,
      startDate: new Date(parsedInput.startDate),
      endDate: new Date(parsedInput.endDate),
      interestRate: parsedInput.interestRate.toFixed(2),
      isActive,
    };

    const [emi] = await db.insert(EMITable).values(insertValues).returning();

    revalidatePath("/emis");
    return {
      ...emi,
      startDate: emi.startDate.toISOString(),
      endDate: emi.endDate.toISOString(),
    };
  });
