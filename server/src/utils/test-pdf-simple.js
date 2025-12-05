import fs from "fs";
import path from "path";
import axios from "axios";
import { extractText } from "./pdfExtractor.js";   // ✅ FIXED
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// -----------------------
// MAIN DOWNLOAD + EXTRACT
// -----------------------
export async function testPdfDownload(cloudinaryUrl) {
  try {
    console.log("🔍 [Test] Starting PDF download test");
    console.log("🔍 [Test] URL:", cloudinaryUrl);

    // Download PDF
    console.log("📥 Downloading PDF...");
    const response = await axios.get(cloudinaryUrl, {
      responseType: "arraybuffer",
    });

    const pdfBuffer = Buffer.from(response.data);
    console.log("📄 PDF downloaded, size:", pdfBuffer.length, "bytes");

    // Create test-output folder
    const outputDir = path.join(__dirname, "test-output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save PDF
    const pdfPath = path.join(outputDir, "downloaded-contract.pdf");
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log("💾 PDF saved to:", pdfPath);

    // Extract text
    console.log("🔍 Extracting text...");
    const extractedText = await extractText(pdfBuffer);
    console.log("📝 Extracted text length:", extractedText.length);

    // Save text output
    const textPath = path.join(outputDir, "extracted-text.txt");
    fs.writeFileSync(textPath, extractedText, "utf8");
    console.log("💾 Text saved to:", textPath);

    console.log("🔍 FIRST 500 CHARACTERS:");
    console.log(extractedText.substring(0, 500));
    console.log("----- END PREVIEW -----");

    console.log("✅ Test completed successfully!");
    return { pdfPath, textPath };
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

// -------------
// AUTO-RUN IF DIRECT CALL
// -------------
if (process.argv[1] === __filename) {
  const url = process.argv[2];
  if (!url) {
    console.error("❌ Usage: node test-pdf-simple.js <cloudinary-pdf-url>");
    process.exit(1);
  }

  console.log("▶️ Running PDF test...");
  testPdfDownload(url);
}
