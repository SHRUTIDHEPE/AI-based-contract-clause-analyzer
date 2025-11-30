// server/utils/pdfExtractor.js
const pdf = require("pdf-parse");

async function extractTextFromPdfBuffer(buffer) {
  const data = await pdf(buffer);
  return data.text || "";
}

module.exports = { extractTextFromPdfBuffer };
