import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

export const ExpensesTable = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    category: text("category").notNull(),
    amount: integer("amount").notNull(),
    date: timestamp("date", { precision: 3, withTimezone: true }).notNull(),
    details: text("details").notNull(),
  },
  (table) => ({
    userIdIdx: index("expenses_user_id_idx").on(table.userId),
  })
);

export const EMITable = pgTable(
  "emis",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    emiName: text("emi_name").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    remainingAmount: decimal("remaining_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    monthlyEmiAmount: decimal("monthly_emi_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    monthlyDueDate: integer("monthly_due_date").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    interestRate: numeric("interest_rate", {
      precision: 5,
      scale: 2,
    }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("emis_user_id_idx").on(table.userId),
  })
);

export const EMIHistoryTable = pgTable(
  "emi_history",
  {
    id: serial("id").primaryKey(),
    emiId: integer("emi_id")
      .notNull()
      .references(() => EMITable.id),
    userId: text("user_id").notNull(),
    paymentDate: timestamp("payment_date").notNull(),
    amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("emi_history_user_id_idx").on(table.userId),
    emiIdIdx: index("emi_history_emi_id_idx").on(table.emiId),
  })
);
