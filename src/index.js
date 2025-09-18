import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
const { VertexAI } = require('@google-cloud/aiplatform');

// Initialize Vertex AI
const vertex_ai = new VertexAI({ project: 'your-gcp-project-id', location: 'us-central1' });
const model = 'gemini-1.5-flash-001'; // Or another Gemini model

// Define the generative model
const generativeModel = vertex_ai.getGenerativeModel({
  model: model,
});

exports.askAiConcierge = async (req, res) => {
  // Set CORS headers to allow your website to call this function
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Get the user's prompt from the request body
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).send('No prompt provided.');
    return;
  }

  try {
    // Send the prompt to the Gemini model
    const resp = await generativeModel.generateContent(prompt);
    const content = resp.response.candidates[0].content;
    const text = content.parts[0].text;
    
    // Send the AI's response back to the React app
    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    res.status(500).send('An error occurred while contacting the AI.');
  }
  const { VertexAI } = require('@google-cloud/aiplatform');

// Initialize Vertex AI with your project ID and location
const vertex_ai = new VertexAI({ project: 'your-gcp-project-id', location: 'us-central1' });
const model = 'gemini-1.5-flash-001';

const generativeModel = vertex_ai.getGenerativeModel({ model: model });

exports.askAiConcierge = async (req, res) => {
  // Allow your website to call this function
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).send('No prompt provided.');
    return;
  }

  try {
    const resp = await generativeModel.generateContent(prompt);
    const content = resp.response.candidates[0].content;
    const text = content.parts[0].text;
    
    // Send the AI's text response back to the React app
    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    res.status(500).send('An error occurred while contacting the AI.');
  }
};
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

