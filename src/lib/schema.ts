import { DeepPartial } from "ai";
import { z } from "zod";

export const expenseSchema = z.object({
  expense: z.object({
    category: z
      .string()
      .describe(
        "Predefined category of the expense. Must be one of: TRAVEL, MEALS, ENTERTAINMENT, OFFICE SUPPLIES, UTILITIES, RENT, GROCERIES, HEALTHCARE, EDUCATION, CLOTHING, TRANSPORTATION, or OTHER. Used for expense classification and detailed financial reporting."
      ),
    amount: z.number().describe("Amount of the expense in INR."),
    date: z.string().describe("Date of the expense, in DD-MMM format."),
    details: z
      .string()
      .describe(
        "Name of the product or service. Note: Proper formatting should be applied, e.g., 'iPhone' instead of 'Iphone'."
      ),
  }),
});

// define a type for the partial notifications during generation
export type PartialExpense = DeepPartial<typeof expenseSchema>["expense"];

export type Expense = z.infer<typeof expenseSchema>["expense"];

export const inputExpenseSchema = z.object({
  expense: z.string().describe("A string describing the expense"),
});

export type InputExpense = z.infer<typeof inputExpenseSchema>;
