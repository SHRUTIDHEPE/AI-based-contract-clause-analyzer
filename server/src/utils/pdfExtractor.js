import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const extractText = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text || "";
  } catch (err) {
    console.error("extractText error:", err);
    return "";
  }
};
