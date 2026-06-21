import { PDFParse } from "pdf-parse";
import fs from "fs";

export const extractPdfText = async (filePath: string) => {
  const dataBuffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: dataBuffer,
  });

  const result = await parser.getText();

  await parser.destroy();

  return result.text;
};