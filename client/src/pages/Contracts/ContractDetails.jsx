import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getContractDetails } from "../../api/contracts";
import { getAnalysis, runAnalysis } from "../../api/analysis";
import AnalysisReport from "../../components/AnalysisReport";

export default function ContractDetails() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchContractData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const contractRes = await getContractDetails(id);
      const fetchedContract = contractRes.data.data;
      setContract(fetchedContract);

      if (fetchedContract.status === "completed") {
        const analysisRes = await getAnalysis(id);
        setAnalysis(analysisRes.data.data);
      }
    } catch (err) {
      setError("Failed to load contract details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setError("");
    try {
      await runAnalysis(id);
      // Optionally, you can poll for status updates or use websockets
      // For now, we'll just inform the user and they can refresh later.
      alert("Analysis has started. The page will refresh shortly to check for results.");
      setTimeout(() => {
        window.location.reload();
      }, 5000); // Simple polling mechanism
    } catch (err) {
      setError("Failed to start analysis.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <div>Loading contract...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!contract) return <div>Contract not found.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-100px)]">
      {/* PDF Viewer */}
      <div className="w-full h-full bg-gray-100 rounded-lg shadow-inner">
        {contract.cloudinaryUrl ? (
          <iframe
            src={contract.cloudinaryUrl}
            title={contract.fileName}
            width="100%"
            height="100%"
            className="border-none rounded-lg"
          >
            Your browser does not support iframes.
          </iframe>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>PDF URL not available.</p>
          </div>
        )}
      </div>

      {/* Details and Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{contract.fileName}</h2>
        <p className="mb-1">
          <span className="font-semibold">Status:</span> {contract.status}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Uploaded on: {new Date(contract.uploadedAt).toLocaleString()}
        </p>

        <hr className="my-6" />

        <div>
          <h3 className="text-xl font-semibold mb-4">Analysis</h3>
          {analysis ? (
            <AnalysisReport analysis={analysis} />
          ) : contract.status === 'uploaded' || contract.status === 'failed' ? (
            <div>
              <p className="mb-4">
                This contract has not been analyzed yet.
              </p>
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
              >
                {isAnalyzing ? "Starting Analysis..." : "Run Analysis"}
              </button>
            </div>
          ) : (
            <p>Analysis is currently in progress...</p>
          )}
        </div>
      </div>
    </div>
  );
}
