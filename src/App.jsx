import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ui.css";

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

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result);
    };
  }, [result]);

  const handleFileChange = (file) => {
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleProcess = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(
        "http://localhost:5000/remove-bg",
        formData,
        { responseType: "blob" },
      );
      const imageUrl = URL.createObjectURL(response.data);
      setResult(imageUrl);
    } catch (error) {
      console.error("Error removing background", error);
    }
    setLoading(false);
  };

  return (
    <div className="app-card" role="main">
      <div className="card-row">
        <div className="panel">
          <h2 className="title">AI Background Remover</h2>
          <p className="subtitle">
            Upload an image and remove its background instantly.
          </p>

          <div className="controls">
            <label className="upload-btn" htmlFor="file-upload">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3v10"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10l5-5 5 5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Choose Image
            </label>

            <input
              id="file-upload"
              className="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />

            <button
              className={`button button--primary`}
              onClick={handleProcess}
              disabled={loading}
            >
              {loading ? (
                <span
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <span className="spinner" /> Processing
                </span>
              ) : (
                "Remove Background"
              )}
            </button>
          </div>

          {result && (
            <div className="result-area">
              <h3 className="subtitle">Result</h3>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div className="preview-box">
                  <img src={result} alt="Result" className="preview-img" />
                </div>
                <div>
                  <a
                    className="download-link"
                    href={result}
                    download="remove-background.png"
                  >
                    Download PNG
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="preview-box" aria-hidden={!preview}>
          {preview ? (
            <img src={preview} alt="Preview" className="preview-img" />
          ) : (
            <div style={{ textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Preview</div>
              <div style={{ fontSize: 13 }}>
                Select an image to preview here
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
