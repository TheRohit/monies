"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ExpensesTable, ParticipantsTable } from "../../../drizzle/schema";
import { db } from "../../../drizzle/db";

const ExpenseSchema = z.object({
  category: z.string(),
  amount: z.number().int(),
  date: z.date(),
  details: z.string(),
  participants: z.array(z.string()),
});

type ExpenseInput = z.infer<typeof ExpenseSchema>;

export async function saveExpense(data: ExpenseInput) {
  try {
    const validatedData = ExpenseSchema.parse(data);

    const [expense] = await db
      .insert(ExpensesTable)
      .values({
        category: validatedData.category,
        amount: validatedData.amount,
        date: validatedData.date.toISOString(),
        details: validatedData.details,
      })
      .returning();

    await db.insert(ParticipantsTable).values(
      validatedData.participants.map((username) => ({
        expenseId: expense.id,
        username,
      }))
    );

    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    console.error("Failed to save expense:", error);
    return { success: false, error: "Failed to save expense" };
  }
}
