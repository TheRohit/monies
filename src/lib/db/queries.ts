import { sql } from "drizzle-orm";
import { db } from "../../../drizzle/db";
import { ExpensesTable } from "../../../drizzle/schema";

export const getExpensesForUser = async (userId: string) => {
  const expenses = await db
    .select()
    .from(ExpensesTable)
    .where(sql`${ExpensesTable.userId} = ${userId}`)
    .orderBy(sql`${ExpensesTable.date} DESC`);

  return expenses.map((expense) => ({
    ...expense,
    date: expense.date.toISOString(),
  }));
};
