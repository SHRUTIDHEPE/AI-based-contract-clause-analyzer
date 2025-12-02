// server/src/utils/pdfExtractor.js
const pdfParse = require("pdf-parse");

async function extractTextFromPdfBuffer(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text || "";
  } catch (err) {
    console.error("extractTextFromPdfBuffer error:", err.message);
    return "";
  }
}

module.exports = { extractTextFromPdfBuffer };
