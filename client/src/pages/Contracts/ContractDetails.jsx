import { useEffect, useState } from "react";
import { getContractDetails } from "../../api/contracts";
import { getAnalysis, runAnalysis } from "../../api/analysis";
import { useParams } from "react-router-dom";

export default function ContractDetails() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await getContractDetails(id);
      setContract(res.data.contract);
      if (res.data.contract.status === "completed") {
        const a = await getAnalysis(id);
        setAnalysis(a.data.analysis);
      }
    })();
  }, [id]);

  const run = async () => {
    await runAnalysis(id);
    alert("Analysis started!");
  };

  return (
    <div>
      {contract && (
        <>
          <h2>{contract.fileName}</h2>
          <p>Status: {contract.status}</p>
          {analysis ? (
            <>
              <h3>Analysis</h3>
              <p>Risk Score: {analysis.riskScore}</p>
              <p>Drift: {analysis.driftType}</p>
            </>
          ) : (
            <button onClick={run}>Run Analysis</button>
          )}
        </>
      )}
    </div>
  );
}
