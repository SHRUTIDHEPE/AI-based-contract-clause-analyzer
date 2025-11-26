import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadContract } from "../../api/contracts";

export default function UploadContract() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setMessage("");
    }
  };

  const upload = async () => {
    if (!file) {
      setMessage("Please select a contract file before uploading.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("contractFile", file);

      const res = await uploadContract(formData);

      navigate("/", {
        state: { message: res.data.message || "Contract uploaded successfully!" },
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to upload contract.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-xl bg-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
        
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Upload Contract
        </h2>

        {/* Upload Area */}
        <label
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition ${
            isDragging ? "border-indigo-500 bg-gray-800/60" : "border-gray-600 bg-gray-800/40 hover:border-indigo-500"
          }`}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-10 h-10 mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16v-8m0 0l3 3m-3-3l-3 3m9-1v6a4 4 0 01-4 4H8a4 4 0 01-4-4V9a4 4 0 014-4h2"
              />
            </svg>

            <p className="text-gray-300 text-sm">
              {file ? (
                <span className="text-indigo-400 font-medium">{file.name}</span>
              ) : (
                "Click or drag file here to upload"
              )}
            </p>
          </div>

          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            ref={fileInputRef}
          />
        </label>

        {/* Upload Button */}
        <button
          onClick={upload}
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? "Uploading..." : "Upload Contract"}
        </button>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm px-3 py-2 rounded-lg ${
              message.toLowerCase().includes("success")
                ? "text-green-400 bg-green-900/30 border border-green-700"
                : "text-red-400 bg-red-900/30 border border-red-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
