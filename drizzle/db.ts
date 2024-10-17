import "./envConfig";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";
import { ExpensesTable, ParticipantsTable } from "./schema";
import { Expense, expenseSchema } from "@/lib/schema";
import { revalidatePath } from "next/cache";

export const db = drizzle(sql, { schema });

export async function saveExpense(data: Expense) {
  const validatedData = expenseSchema.parse(data);

  const [expense] = await db
    .insert(ExpensesTable)
    .values({
      category: validatedData.expense.category,
      amount: validatedData.expense.amount,
      date: validatedData.expense.date,
      details: validatedData.expense.details,
    })
    .returning();

  await db.insert(ParticipantsTable).values(
    validatedData.expense.participants.map((username) => ({
      expenseId: expense.id,
      username,
    }))
  );

  revalidatePath("/expenses");
}

// export async function getAllExpenses() {
//   try {
//     const expenses = await db.select().from(ExpensesTable);
//     const expensesWithParticipants = await Promise.all(
//       expenses.map(async (expense) => {
//         const participants = await db
//           .select()
//           .from(ParticipantsTable)
//           .where(sql`${ParticipantsTable.expenseId} = ${expense.id}`);

//         return {
//           ...expense,
//           participants: participants.map((p) => p.username),
//         };
//       })
//     );

//     return expensesWithParticipants;
//   } catch (error) {
//     console.error("Failed to fetch expenses:", error);
//     throw new Error("Failed to fetch expenses");
//   }
// }
