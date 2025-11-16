export default function ContractCard({ c }) {
  return (
    <div className="contract-card">
      <h3>{c.fileName}</h3>
      <p>Status: {c.status}</p>
      <p>Uploaded: {new Date(c.uploadedAt).toLocaleString()}</p>
    </div>
  );
}
