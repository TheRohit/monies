import { saveExpense } from "@/app/actions/expenses";
import { expenseSchema } from "@/lib/schema";
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";

export const maxDuration = 30;

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { expense }: { expense: string } = await req.json();

  const currentDateTime = new Date().toISOString();

  const result = await streamObject({
    model: groq("llama3-groq-8b-8192-tool-use-preview"),
    system:
      "You categorize expenses into one of the following categories: " +
      "TRAVEL, MEALS, ENTERTAINMENT, OFFICE SUPPLIES, OTHER." +
      "The current date and time is: " +
      currentDateTime +
      ". Use this as the expense date.",
    prompt: `Please categorize the following expense: "${expense}"`,
    schema: expenseSchema,
    onFinish: async ({ object }) => {
      if (!object) return;
      await saveExpense({
        amount: object.expense.amount,
        category: object.expense.category,
        date: new Date().toISOString(),
        details: object.expense.details,
      });
    },
  });

  return result.toTextStreamResponse();
}
