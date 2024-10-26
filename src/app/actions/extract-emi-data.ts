"use server";

import { authActionClient } from "@/lib/safe-action";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import _ from "lodash";
import { revalidatePath } from "next/cache";
import "server-only";
import { z } from "zod";

const EMISchema = z.object({
  emiName: z.string().describe("Name of the loan"),
  totalAmount: z.number().describe("Total amount of the loan"),
  monthlyEmiAmount: z.number().describe("Monthly EMI amount"),
  monthlyDueDate: z.number().min(1).max(31).describe("Monthly due date"),
  startDate: z.string().describe("Start date of the loan"),
  endDate: z.string().describe("End date of the loan"),
  interestRate: z.number().describe("Annual interest rate of the loan"),
  installments: z
    .array(
      z.object({
        dueDate: z.string(),
        principal: z.number(),
        interest: z.number(),
      })
    )
    .describe("Array of installments with due date, principal, and interest"),
});

const InputSchema = z.object({
  parsedPdf: z.string(),
});

export type EMIData = z.infer<typeof EMISchema> & {
  principalPaid: number;
  installmentsPaid: number;
  remainingInstallments: number;
  remainingPrincipal: number;
};

export const extractEMIDataAction = authActionClient
  .metadata({ actionName: "extractEMIData" })
  .schema(InputSchema)
  .action(async ({ parsedInput }) => {
    const { parsedPdf } = parsedInput;
    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY!,
    });

    const today = new Date();

    const { object } = await generateObject({
      model: groq("llama-3.1-70b-versatile"),
      prompt: `Extract EMI data from the following PDF text. Include an array of installments with due date, principal, and interest for each. Today's date is ${
        today.toISOString().split("T")[0]
      }. 
      
      PDF Text:
      ${parsedPdf}`,
      schema: EMISchema,
      temperature: 0.2,
    });

    const paidInstallments = _.takeWhile(
      object.installments,
      (installment) => new Date(installment.dueDate) < today
    );

    const principalPaid = _.sumBy(paidInstallments, "principal");

    const emiData: EMIData = {
      ...object,
      principalPaid: _.round(principalPaid, 2),
      installmentsPaid: paidInstallments.length,
      remainingInstallments:
        object.installments.length - paidInstallments.length,
      remainingPrincipal: _.round(object.totalAmount - principalPaid, 2),
      startDate: new Date(object.startDate).toISOString(),
      endDate: new Date(object.endDate).toISOString(),
    };

    revalidatePath("/emi");

    return emiData;
  });
