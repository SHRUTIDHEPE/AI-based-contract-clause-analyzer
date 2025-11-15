export default function Upload() {
  return (
    <div className="page container">
      <div className="page-header">
        <h2>Upload Contract</h2>
        <p className="muted">Drop a file to begin clause analysis</p>
      </div>

      <div className="upload-area">
        <div className="dropzone">
          <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden><path d="M5 20h14v-2H5v2zM12 3l4 4h-3v6h-2V7H8l4-4z" fill="currentColor"/></svg>
          <p>Drag & drop or <strong>browse</strong></p>
          <input className="file-input" type="file" />
        </div>

        <aside className="panel small">
          <h4>Tips</h4>
          <ul className="list">
            <li>Supported: PDF, DOCX, TXT</li>
            <li>Max file size: 10 MB</li>
            <li>Analyses are anonymized for demo</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
