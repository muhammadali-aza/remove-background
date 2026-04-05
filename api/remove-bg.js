export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS Headers (Fix for the red error in your console)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const backendUrl = process.env.VITE_API_URL || "https://remove-background-lovat-nine.vercel.app";
  
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const response = await fetch(`${backendUrl}/api/python`, {
      method: "POST",
      headers: { "Content-Type": req.headers["content-type"] },
      body: body,
    });

    const data = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}