// Vercel Serverless function to proxy /api/remove-bg to the real backend
// It forwards the incoming multipart/form-data body to the configured backend
// backend URL is taken from process.env.VITE_API_URL or process.env.API_URL.

async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").end("Method Not Allowed");
    return;
  }
export default async function handler(req, res) {
  // Sirf POST request allow karein
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").end("Method Not Allowed");
    return;
  }

  // CORS Headers set karein (Browser errors fix karne ke liye)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Preflight request handle karein
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Backend URL check karein
  const envUrl = process.env.VITE_API_URL || process.env.API_URL || "";
  const backendBase = envUrl ? String(envUrl).replace(/\/$/, "") : "";

  if (!backendBase) {
    return res.status(500).json({
      error: "Backend URL not configured. Set VITE_API_URL in Vercel environment variables.",
    });
  }

  try {
    // 1. Raw body (image data) collect karein
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    // 2. Headers forward karein (Mismatches avoid karne ke liye sensitive headers delete karein)
    const forwardHeaders = { ...req.headers };
    delete forwardHeaders.host;
    delete forwardHeaders.connection;
    delete forwardHeaders['content-length']; // Fetch automatically calculate karega

    const target = `${backendBase}/remove-bg`;

    // 3. Backend (Python) ko request forward karein
    const fetchRes = await fetch(target, {
      method: "POST",
      headers: forwardHeaders,
      body: body,
    });

    // 4. Backend response status check karein
    if (!fetchRes.ok) {
      const errorText = await fetchRes.text();
      return res.status(fetchRes.status).json({ error: "Backend Error", details: errorText });
    }

    // 5. Image data return karein
    const contentType = fetchRes.headers.get("content-type");
    res.setHeader("Content-Type", contentType || "image/png");
    
    const arrayBuffer = await fetchRes.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));

  } catch (err) {
    console.error("Proxy to backend failed:", err);
    res.status(502).json({
      error: "Failed to proxy request to backend",
      message: err.message,
    });
  }
}
}
