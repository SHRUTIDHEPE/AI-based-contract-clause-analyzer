import { useDropzone } from 'react-dropzone';

export default function Upload() {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': [] },
    onDrop: (files) => {
      alert(`Uploaded: ${files[0].name}`);
    }
  });

  return (
    <div>
      <h2>Upload Contract</h2>
      <div {...getRootProps()} style={{border: "2px dashed gray", padding: "20px", cursor: "pointer"}}>
        <input {...getInputProps()} />
        <p>Drag & drop a PDF here, or click to select</p>
      </div>
    </div>
  );
}
