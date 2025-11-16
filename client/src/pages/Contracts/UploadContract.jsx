import { useState } from "react";
import { uploadContract } from "../../api/contracts";

export default function UploadContract() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    const fd = new FormData();
    fd.append("file", file);
    await uploadContract(fd);
    alert("Uploaded!");
  };

  return (
    <div>
      <h2>Upload Contract</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={upload}>Upload</button>
    </div>
  );
}
