import { sql } from "drizzle-orm";
import { ExpensesTable } from "../../../drizzle/schema";
import { db } from "../../../drizzle/db";

export const getExpensesForUser = async (userId: string) => {
  const expenses = await db
    .select()
    .from(ExpensesTable)
    .where(sql`${ExpensesTable.userId} = ${userId}`)
    .orderBy(sql`${ExpensesTable.date} DESC`);

  return expenses;
};
