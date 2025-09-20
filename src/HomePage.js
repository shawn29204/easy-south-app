// File: /src/pages/HomePage.js
import React, { useState } from 'react';
import AIChatInputForm from '../components/AIChatInputForm';
import ResultsWithAdSkin from '../components/ResultsWithAdSkin';

// The URL for your live backend function
const YOUR_AI_FUNCTION_URL = 'https://ai-concierge-backend.vercel.app/api/askAI';

async function fetchFromApi(prompt) {
  const isMapQuery = ['find', 'show me', 'where is', 'address of'].some(keyword => prompt.toLowerCase().includes(keyword));

  const response = await fetch(YOUR_AI_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, isMapQuery }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get response from API.');
  }

  return response.json();
}

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiResults, setAiResults] = useState(null);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    setAiResults(null);
    
    try {
      const result = await fetchFromApi(query);
      setAiResults(result);
    } catch (err) {
      setError(`Sorry, an error occurred: ${err.message}`);
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
          <div className="bg-white p-6 rounded-lg shadow-md">
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