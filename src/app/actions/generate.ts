"use server";

import { actionClient } from "@/lib/safe-action";
import { expenseSchema } from "@/lib/schema";
import { streamObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export const generate = actionClient
  .schema(expenseSchema)
  .action(async ({ parsedInput: { expense } }) => {
    const result = await streamObject({
      model: groq("llama3-groq-8b-8192-tool-use-preview"),
      system:
        "You categorize expenses into one of the following categories: " +
        "TRAVEL, MEALS, ENTERTAINMENT, OFFICE SUPPLIES, OTHER." +
        // provide date (including day of week) for reference:
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
      onFinish({ object }) {
        // save object to database
        console.log(object);
      },
    });

    return result.toTextStreamResponse();
  });
