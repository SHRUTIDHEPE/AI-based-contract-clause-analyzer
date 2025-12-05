import axios from "axios";

export const downloadPdf = async (url, maxBytes = 15 * 1024 * 1024) => {
  console.log("📥 [downloadPdf] Starting download from Cloudinary URL:");
  console.log("URL:", url);

  try {
    console.log("📥 [downloadPdf] Sending GET request to Cloudinary...");
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
      maxContentLength: maxBytes,
      validateStatus: () => true,   // allow debugging non-200 responses
    });

    console.log("📥 [downloadPdf] Received response from Cloudinary.");
    console.log("📥 [downloadPdf] HTTP Status:", res.status);
    console.log("📥 [downloadPdf] Response headers:", res.headers);

    if (res.status !== 200) {
      console.log("❌ [downloadPdf] Cloudinary returned non-200 response.");
      console.log("❌ [downloadPdf] Response data length:", res.data?.length || 0);
      return null;
    }

    console.log("📦 [downloadPdf] Download successful.");
    console.log("📏 [downloadPdf] File size:", res.data?.length, "bytes");

    const buffer = Buffer.from(res.data);
    console.log("📦 [downloadPdf] Buffer created, length:", buffer.length);

    return buffer;
  } catch (err) {
    console.error("❌ [downloadPdf] Error downloading PDF:", err.message);
    console.error("❌ [downloadPdf] Error details:", err);
    return null;
  }
};
