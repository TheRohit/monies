"use server";

import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { extractTextFromPDF } from "@/lib/pdf-utils";

const EMISchema = z.object({
  emiName: z.string().min(1, "EMI name is required"),
  totalAmount: z.number().positive("Total amount must be positive"),
  amountPaid: z.number().nonnegative("Amount paid must be non-negative"),
  monthlyEmiAmount: z.number().positive("Monthly EMI amount must be positive"),
  monthlyDueDate: z
    .number()
    .min(1)
    .max(31, "Monthly due date must be between 1 and 31"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  interestRate: z.number().nonnegative("Interest rate must be non-negative"),
});

const ExtractEMIDataSchema = z.object({
  pdfFile: z.instanceof(Buffer),
  password: z.string().optional(),
});

export const extractEMIDataAction = authActionClient
  .metadata({ actionName: "extractEMIData" })
  .schema(ExtractEMIDataSchema)
  .action(async ({ parsedInput }) => {
    try {
      const pdfText = await extractTextFromPDF(
        parsedInput.pdfFile,
        parsedInput.password
      );

      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY!,
      });

      const today = new Date().toISOString().split("T")[0];

      const { object } = await generateObject({
        model: groq("llama-3.1-70b-versatile"),
        prompt: `You are an AI assistant specialized in extracting EMI (Equated Monthly Installment) data from PDF text. Extract the required information and calculate derived values as needed. Here are the instructions:

        Extract the following EMI data from the given PDF text:
        1. EMI Name (loan name or description)
        2. Total Amount (total loan amount)
        3. Monthly EMI Amount
        4. Monthly Due Date (as a number, 1-31)
        5. Start Date (in YYYY-MM-DD format)
        6. End Date (in YYYY-MM-DD format)
        7. Annual Interest Rate

        Also, calculate:
        8. Amount Paid (sum of principal amounts paid up to the current date)
        9. Monthly Interest Rate (annual rate divided by 12)

        Use "N/A" for missing string fields and 0 for missing numeric fields.
        Round all numeric values to two decimal places.
        The interestRate should be the monthly rate, expressed as a percentage.

        Today's date is ${today}. Use this date for calculating the amount paid so far.

        Provide the extracted and calculated data in the specified JSON format.

        PDF Text:
        ${pdfText}`,
        schema: EMISchema,
        temperature: 0.2,
      });

      revalidatePath("/emi"); // Adjust this path as needed

      return {
        success: true,
        emiData: {
          ...object,
          startDate: new Date(object.startDate).toISOString(),
          endDate: new Date(object.endDate).toISOString(),
        },
      };
    } catch (error) {
      console.error("Failed to extract EMI data:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to extract EMI data",
      };
    }
  });
