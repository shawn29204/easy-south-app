import React from 'react';
import { motion } from 'framer-motion';

const ResultsWithAdSkin = ({ children }) => {
  const adSkinVariant = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.5 } }
  };
  const adSkinVariantRight = {
    ...adSkinVariant,
    hidden: { opacity: 0, x: 30 },
  };

  return (
    <div className="w-full flex justify-center py-8">
      <div className="flex w-full max-w-7xl mx-auto px-6">
        <motion.div className="hidden xl:block w-48 mr-8" variants={adSkinVariant} initial="hidden" animate="visible">
          <div className="bg-white h-96 p-4 rounded-lg shadow-md border flex flex-col items-center text-center text-sm">
            <svg className="w-12 h-12 text-orange-500 mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <h4 className="font-bold text-gray-800 mt-3">Virtual Reality Camp for Seniors</h4>
            <p className="text-gray-600 mt-2 flex-grow">Stay sharp and explore new worlds.</p>
            <button className="w-full bg-orange-600 text-white py-2 rounded-full hover:bg-orange-700 transition">Learn More</button>
          </div>
        </motion.div>

        <div className="w-full flex-grow max-w-3xl">{children}</div>

        <motion.div className="hidden xl:block w-48 ml-8" variants={adSkinVariantRight} initial="hidden" animate="visible">
          <div className="bg-white h-96 p-4 rounded-lg shadow-md border flex flex-col items-center text-center text-sm">
            <svg className="w-12 h-12 text-orange-500 mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <h4 className="font-bold text-gray-800 mt-3">"Voted most wholesome realtor in Columbia, SC!"</h4>
            <p className="text-gray-600 mt-2 flex-grow">Find your perfect home with Susan.</p>
            <button className="w-full bg-orange-600 text-white py-2 rounded-full hover:bg-orange-700 transition">Contact Susan</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsWithAdSkin;