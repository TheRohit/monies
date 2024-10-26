"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { authActionClient } from "@/lib/safe-action";
import { promises as fs } from "fs";
import PDFParser from "pdf2json";
import "server-only";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const ParsePDFSchema = z.object({
  file: z.instanceof(File),
  password: z.string().optional(),
});

export const parsePDFAction = authActionClient
  .metadata({ actionName: "parsePDF" })
  .schema(ParsePDFSchema)
  .action(async ({ parsedInput }) => {
    const { file, password } = parsedInput;
    const fileName = uuidv4();
    const tempFilePath = `/tmp/${fileName}.pdf`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    const pdfParser = new (PDFParser as any)(null, 1, password || null);

    pdfParser.on("pdfParser_dataError", (errData: any) =>
      console.error(errData.parserError)
    );

    const parsedText = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.on("pdfParser_dataError", reject);
      pdfParser.loadPDF(tempFilePath);
    });

    await fs.unlink(tempFilePath);

    return {
      fileName,
      parsedText,
    };
  });
