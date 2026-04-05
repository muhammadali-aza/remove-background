import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleProcess = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(
        "http://localhost:5000/remove-bg",
        formData,
        {
          responseType: "blob",
        },
      );
      const imageUrl = URL.createObjectURL(response.data);
      setResult(imageUrl);
    } catch (error) {
      console.error("Error removing background", error);
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>AI Background Remover</h1>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          setImage(file);
          if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
          } else {
            setPreview(null);
          }
        }}
      />

      {preview && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: 300 }}
          />
        </div>
      )}

      <button onClick={handleProcess} disabled={loading}>
        {loading ? "Processing..." : "Remove Background"}
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <img src={result} alt="Result" style={{ maxWidth: "100%" }} />
          <br />
          <a href={result} download="no-bg.png">
            Download Image
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
