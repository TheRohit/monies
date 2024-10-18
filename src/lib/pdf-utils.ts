import { PDFExtract, PDFExtractOptions } from "pdf.js-extract";

export async function extractTextFromPDF(
  pdfBuffer: Buffer,
  password?: string
): Promise<string> {
  const pdfExtract = new PDFExtract();
  const options: PDFExtractOptions = {
    password: password,
  };

  try {
    const data = await pdfExtract.extractBuffer(pdfBuffer, options);

    // Combine text from all pages
    const text = data.pages
      .map((page) => page.content.map((item) => item.str).join(" "))
      .join("\n");

    return text;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Password required") ||
        error.message.includes("Incorrect password")
      ) {
        throw new Error(
          "PDF is password protected. Please provide the correct password."
        );
      }
    }
    throw new Error("Failed to extract text from PDF");
  }
}
