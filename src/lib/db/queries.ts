import { sql } from "drizzle-orm";
import { db } from "../../../drizzle/db";
import { EMITable, ExpensesTable } from "../../../drizzle/schema";

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

export const getEMIsForUser = async (userId: string) => {
  const emis = await db
    .select()
    .from(EMITable)
    .where(sql`${EMITable.userId} = ${userId}`);

  return emis.map((emi) => ({
    ...emi,
    startDate: emi.startDate.toISOString(),
    endDate: emi.endDate.toISOString(),
  }));
};
