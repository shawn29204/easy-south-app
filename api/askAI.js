// File: /api/askAI.js
const { VertexAI } = require('@google-cloud/aiplatform');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const vertex_ai = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: 'us-central1'
  });
  const model = 'gemini-1.5-flash-001';
  const generativeModel = vertex_ai.getGenerativeModel({ model });

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'No prompt provided.' });
  }

  try {
    const resp = await generativeModel.generateContent(prompt);
    const text = resp.response.candidates[0].content.parts[0].text;
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error calling Vertex AI:', error.message);
    return res.status(500).json({ message: 'An error occurred while contacting the AI.' });
  }
}