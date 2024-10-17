import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const ExpensesTable = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    category: text("category").notNull(),
    amount: integer("amount").notNull(),
    date: date("date").notNull(),
    details: text("details").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (expenses) => {
    return {
      uniqueIdx: uniqueIndex("unique_idx").on(expenses.id),
    };
  }
);

export const ParticipantsTable = pgTable("participants", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id")
    .notNull()
    .references(() => ExpensesTable.id),
  username: text("username").notNull(),
});
