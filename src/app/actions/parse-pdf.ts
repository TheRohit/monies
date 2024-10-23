"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { authActionClient } from "@/lib/safe-action";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import { z } from "zod";
import "server-only";

const ParsePDFSchema = z.object({
  file: z.instanceof(File),
  password: z.string().optional(),
});

export const parsePDFAction = authActionClient
  .metadata({ actionName: "parsePDF" })
  .schema(ParsePDFSchema)
  .action(async ({ parsedInput }) => {
    const { file, password } = parsedInput;
    let fileName = "";
    let parsedText = "";
    let tempFilePath = "";

    try {
      fileName = uuidv4();
      tempFilePath = `/tmp/${fileName}.pdf`;

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(tempFilePath, fileBuffer);

      const pdfParser = new (PDFParser as any)(null, 1, password || null);

      pdfParser.on("pdfParser_dataError", (errData: any) =>
        console.error(errData.parserError)
      );

      const parseResult = await new Promise<string>((resolve, reject) => {
        pdfParser.on("pdfParser_dataReady", () => {
          resolve(pdfParser.getRawTextContent());
        });
        pdfParser.on("pdfParser_dataError", reject);
        pdfParser.loadPDF(tempFilePath);
      });

      parsedText = parseResult;

      return {
        success: true,
        fileName,
        parsedText,
      };
    } catch (error) {
      console.error("Failed to parse PDF:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse PDF",
      };
    } finally {
      if (tempFilePath) {
        await fs.unlink(tempFilePath).catch(console.error);
      }
    }
  });
