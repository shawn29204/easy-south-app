import React, { useState } from 'react';
import AIChatInputForm from '../components/AIChatInputForm';
import ResultsWithAdSkin from '../components/ResultsWithAdSkin';

// --- API Keys and URLs ---
const YOUR_GOOGLE_MAPS_API_KEY = 'PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE';
const YOUR_VERTEX_AI_FUNCTION_URL = 'PASTE_YOUR_CLOUD_FUNCTION_URL_HERE';

// --- API Logic from before ---
async function fetchGoogleMapsPlace(query) {
  // ... (the Google Maps function we already have)
}

// --- NEW: Function to call our Vertex AI backend ---
async function fetchVertexAIResponse(prompt) {
  const response = await fetch(YOUR_VERTEX_AI_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt }),
  });
  if (!response.ok) {
    throw new Error('Failed to get response from AI.');
  }
  const data = await response.json();
  return { text: data.response }; // Return a text response
}


const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiResults, setAiResults] = useState(null);

  // --- UPDATED: The search handler is now smarter ---
  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    setAiResults(null);
    
    // Simple logic to decide which API to call
    const isMapQuery = ['find', 'show me', 'where is', 'what is the address of'].some(keyword => query.toLowerCase().includes(keyword));

    try {
      let result;
      if (isMapQuery) {
        // It's a map question, call Google Maps
        result = await fetchGoogleMapsPlace(query);
      } else {
        // It's a general question, call Vertex AI
        result = await fetchVertexAIResponse(query);
      }
      setAiResults(result);
    } catch (err) {
      setError('Sorry, I couldn\'t find an answer. Please try another question.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center p-12 bg-orange-50">
        <h1 className="text-4xl font-bold">Welcome to Easy South</h1>
        <p className="text-xl mt-4">Your trusted relocation concierge.</p>
      </div>
      
      <div className="my-12">
        <AIChatInputForm onSubmit={handleSearch} isLoading={isLoading} />
      </div>

      {isLoading && <p className="text-center text-gray-600">Thinking...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {aiResults && (
        <ResultsWithAdSkin>
          {/* UPDATED: This now renders either a map result or a text result */}
          <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            {aiResults.streetViewUrl ? (
              // Display Map Result
              <div>
                <h3 className="text-2xl font-bold mb-2">{aiResults.name}</h3>
                <p className="text-gray-700 mb-4">{aiResults.address}</p>
                <img 
                  src={aiResults.streetViewUrl} 
                  alt={`Street view of ${aiResults.name}`} 
                  className="w-full rounded-md border"
                />
              </div>
            ) : (
              // Display AI Text Result
              <div>
                <h3 className="text-2xl font-bold mb-4">Concierge Response:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{aiResults.text}</p>
              </div>
            )}
          </div>
        </ResultsWithAdSkin>
      )}
    </div>
  );
};

export default HomePage;