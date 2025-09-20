import React, { useState } from 'react';
import AIChatInputForm from '../components/AIChatInputForm';
import ResultsWithAdSkin from '../components/ResultsWithAdSkin';
import { motion } from 'framer-motion';

// --- API Logic ---
const YOUR_GOOGLE_MAPS_API_KEY = 'AIzaSyCe76Eul17__EWDbS6rwo8gPGGvtSBedRQ';
const YOUR_VERTEX_AI_FUNCTION_URL = 'https://ai-concierge-backend.vercel.app/';

async function fetchGoogleMapsPlace(query) {
  const placesApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${YOUR_GOOGLE_MAPS_API_KEY}`;
  try {
    const placesResponse = await fetch(placesApiUrl);
    const placesData = await placesResponse.json();
    if (placesData.status !== 'OK' || !placesData.results || placesData.results.length === 0) {
      throw new Error('No places found for that query.');
    }
    const place = placesData.results[0];
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${place.geometry.location.lat},${place.geometry.location.lng}&key=${YOUR_GOOGLE_MAPS_API_KEY}`;
    return { name: place.name, address: place.formatted_address, streetViewUrl };
  } catch (error) {
    console.error('Error fetching data from Google Maps:', error);
    throw error;
  }
}

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
  return { text: data.response };
}

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiResults, setAiResults] = useState(null);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    setAiResults(null);
    
    const isMapQuery = ['find', 'show me', 'where is', 'address of'].some(keyword => query.toLowerCase().includes(keyword));

    try {
      let result;
      if (isMapQuery) {
        result = await fetchGoogleMapsPlace(query);
      } else {
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
          <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            {aiResults.streetViewUrl ? (
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