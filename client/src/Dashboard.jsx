export default function Dashboard() {
  return (
    <div className="page container">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="muted">Recent uploads and analysis summary</p>
      </div>

      <div className="grid">
        <div className="panel">
          <h4>Recent Uploads</h4>
          <ul className="list">
            <li><strong>Master Services Agreement.pdf</strong> — Risk: Medium</li>
            <li><strong>Supplier Contract.docx</strong> — Risk: High</li>
            <li><strong>NDAs.zip</strong> — Risk: Low</li>
          </ul>
          <div className="panel-foot">
            <button className="btn-primary">Upload new</button>
            <button className="btn-ghost">See all</button>
          </div>
        </div>

        <div className="panel">
          <h4>Top Clauses Needing Attention</h4>
          <ol className="list numbered">
            <li>Indemnity — Broad, missing cap</li>
            <li>Confidentiality — no carve-outs</li>
            <li>Termination — long notice period</li>
          </ol>
        </div>

        <div className="panel">
          <h4>Overall Risk Snapshot</h4>
          <div className="meter">
            <div className="meter-bar" style={{width: '46%'}}></div>
          </div>
          <p className="muted">Average contract risk across recent uploads</p>
        </div>
      </div>
    </div>
  );
}
