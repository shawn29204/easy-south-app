import React from 'react';
import { motion } from 'framer-motion';

const AIChatInputForm = ({ onSubmit, isLoading }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const query = formData.get('ai-prompt');
    onSubmit(query);
  };

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto bg-white/80 p-8 rounded-2xl shadow-lg border border-orange-100"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Future Proof Cities AI Concierge
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Ask a question about relocating, or tap the microphone to speak.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <input
            type="text"
            name="ai-prompt"
            placeholder="e.g., 'Find a park near Charleston, SC'"
            className="w-full text-base md:text-lg py-4 pr-28 pl-6 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300 shadow-inner disabled:opacity-50"
            aria-label="Ask the AI Concierge a question"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 space-x-1">
            <button
              type="button"
              onClick={() => alert('Voice input coming soon!')}
              title="Ask with your voice"
              className="p-2 rounded-full text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition disabled:opacity-50"
              aria-label="Activate voice input"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button
              type="submit"
              title="Submit question"
              className="p-2 rounded-full text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition disabled:opacity-50"
              aria-label="Submit question"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AIChatInputForm;