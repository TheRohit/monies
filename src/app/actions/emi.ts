"use server";

import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../../../drizzle/db";
import { EMITable, EMIHistoryTable } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

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
    try {
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

      // Backfill previous months
      await backfillEMIHistory(emi, parsedInput.amountPaid);

      revalidatePath("/emis");
      return {
        success: true,
        emi: {
          ...emi,
          startDate: emi.startDate.toISOString(),
          endDate: emi.endDate.toISOString(),
        },
      };
    } catch (error) {
      console.error("Failed to save EMI:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save EMI",
      };
    }
  });

async function backfillEMIHistory(
  emi: typeof EMITable.$inferSelect,
  amountPaid: number
) {
  const today = new Date();
  const currentDate = new Date(emi.startDate);
  let remainingAmount = parseFloat(emi.totalAmount);
  let totalPaid = 0;

  while (
    currentDate <= today &&
    currentDate < emi.endDate &&
    totalPaid < amountPaid
  ) {
    const interestForMonth =
      (remainingAmount * parseFloat(emi.interestRate)) / 1200;
    const principalForMonth =
      parseFloat(emi.monthlyEmiAmount) - interestForMonth;
    const paymentAmount = Math.min(
      parseFloat(emi.monthlyEmiAmount),
      amountPaid - totalPaid
    );

    remainingAmount -= principalForMonth;
    totalPaid += paymentAmount;

    await db.insert(EMIHistoryTable).values({
      emiId: emi.id,
      userId: emi.userId,
      paymentDate: currentDate,
      amountPaid: paymentAmount.toFixed(2),
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Update the remaining amount and isActive status in the EMI table
  const newRemainingAmount = Math.max(0, remainingAmount);
  const isActive = newRemainingAmount > 0;
  await db
    .update(EMITable)
    .set({
      remainingAmount: newRemainingAmount.toFixed(2),
      isActive,
    })
    .where(eq(EMITable.id, emi.id));
}
