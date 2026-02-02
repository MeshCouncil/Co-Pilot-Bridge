
export default async function handler(request, response) {
  // Only allow POST
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  // Shared secret check
  const clientSecret = request.headers["x-mesh-key"];
  const serverSecret = process.env.MESH_SHARED_SECRET;

  if (!clientSecret || clientSecret !== serverSecret) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Forward the request body to Copilot
    const copilotResponse = await fetch(
      "https://api.githubcopilot.com/v1/assistant",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Your private Mesh-Core will add the real key locally
          Authorization: request.headers["authorization"]
        },
        body: JSON.stringify(request.body)
      }
    );

    const data = await copilotResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ error: "Bridge error", details: error.message });
  }
}
