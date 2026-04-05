// Vercel Serverless function to proxy /api/remove-bg to the real backend
// It forwards the incoming multipart/form-data body to the configured backend
// backend URL is taken from process.env.VITE_API_URL or process.env.API_URL.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").end("Method Not Allowed");
    return;
  }

  // Prefer VITE_API_URL; fallback to API_URL for server env var variety
  const envUrl = process.env.VITE_API_URL || process.env.API_URL || "";
  const backendBase = envUrl ? String(envUrl).replace(/\/$/, "") : "";

  // If no backend is configured, return helpful error
  if (!backendBase) {
    res
      .status(500)
      .json({
        error:
          "Backend URL not configured. Set VITE_API_URL (or API_URL) in Vercel environment variables.",
      });
    return;
  }

  try {
    // Collect raw request body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    // Forward headers but remove host to avoid mismatches
    const forwardHeaders = { ...req.headers };
    delete forwardHeaders.host;

    const target = `${backendBase}/remove-bg`;

    const fetchRes = await fetch(target, {
      method: "POST",
      headers: forwardHeaders,
      body,
    });

    // Forward status and headers
    res.statusCode = fetchRes.status;
    fetchRes.headers.forEach((value, key) => {
      // Some headers like transfer-encoding should be skipped
      if (key.toLowerCase() === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    const arrayBuffer = await fetchRes.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Proxy to backend failed:", err);
    res
      .status(502)
      .json({
        error: "Failed to proxy request to backend: " + String(err.message),
      });
  }
}
