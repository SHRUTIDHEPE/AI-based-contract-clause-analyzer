// server/src/utils/downloadPdf.js
const axios = require("axios");

async function downloadPdfFromUrl(url, maxBytes = 15 * 1024 * 1024) {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
      maxContentLength: maxBytes,
    });
    return Buffer.from(res.data);
  } catch (err) {
    console.error("downloadPdfFromUrl error:", err.message);
    return null;
  }
}

module.exports = { downloadPdfFromUrl };
