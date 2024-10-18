"use server";

import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../../../drizzle/db";
import { ExpensesTable } from "../../../drizzle/schema";

const ExpenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().int().positive("Amount must be a positive integer"),
  date: z.string().datetime(),
  details: z.string().optional(),
});

export const saveExpense = authActionClient
  .metadata({ actionName: "saveExpense" })
  .schema(ExpenseSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    try {
      const [expense] = await db
        .insert(ExpensesTable)
        .values({
          userId,
          category: parsedInput.category,
          amount: parsedInput.amount,
          date: new Date(parsedInput.date),
          details: parsedInput.details || "",
        })
        .returning();

      revalidatePath("/expenses");
      return {
        success: true,
        expense: {
          ...expense,
          date: expense.date.toISOString(),
        },
      };
    } catch (error) {
      console.error("Failed to save expense:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to save expense",
      };
    }
  });
