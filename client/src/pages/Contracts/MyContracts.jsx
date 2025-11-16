import { useEffect, useState } from "react";
import { getMyContracts } from "../../api/contracts";

export default function MyContracts() {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await getMyContracts();
      setContracts(res.data.contracts);
    })();
  }, []);

  return (
    <div>
      <h2>My Contracts</h2>
      {contracts.map((c) => (
        <div key={c.id}>{c.fileName} — {c.status}</div>
      ))}
    </div>
  );
}
