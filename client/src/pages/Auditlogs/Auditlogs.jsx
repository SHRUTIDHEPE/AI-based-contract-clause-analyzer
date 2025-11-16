import { useEffect, useState } from "react";
import { getAuditLogs } from "../../api/auditLogs";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await getAuditLogs();
      setLogs(r.data.logs);
    })();
  }, []);

  return (
    <div>
      <h2>Audit Logs</h2>
      {logs.map((l) => (
        <div key={l.id}>
          {l.action} — {l.details} — {new Date(l.timestamp).toLocaleString()}
        </div>
      ))}
    </div>
  );
}
