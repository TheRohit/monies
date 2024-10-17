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

  const result = await streamObject({
    model: groq("llama3-groq-8b-8192-tool-use-preview"),
    system:
      "You categorize expenses into one of the following categories: " +
      "TRAVEL, MEALS, ENTERTAINMENT, OFFICE SUPPLIES, OTHER." +
      "The current date is: " +
      new Date()
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          weekday: "short",
        })
        .replace(/(\w+), (\w+) (\d+), (\d+)/, "$4-$2-$3 ($1)") +
      ". When no date is supplied, use the current date.",
    prompt: `Please categorize the following expense: "${expense}"`,
    schema: expenseSchema,
    onFinish: async ({ object }) => {
      try {
        if (!object) {
          return;
        }
        await saveExpense({
          amount: object.expense.amount,
          category: object.expense.category,
          date: object.expense.date,
          details: object.expense.details,
        });
      } catch (error) {
        console.error("Failed to save expense:", error);
        throw new Error("Failed to save expense");
      }
    },
  });

  return result.toTextStreamResponse();
}
