import { useState } from "react";
import { uploadContract } from "../../api/contracts";

export default function UploadContract() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const upload = async () => {
    if (!file) {
      setMessage("Please select a contract file before uploading.");
      return;
    }
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("contractFile", file);
      const response = await uploadContract(fd);
      // Show only clean success message from server response
      setMessage(response.data.message || "Contract uploaded successfully.");
    } catch (error) {
      // Show a clean error message without exposing full response
      setMessage(error.response?.data?.message || "Failed to upload contract.");
    }
  };

  return (
    <div>
      <h2>Upload Contract</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={upload}>Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
}
