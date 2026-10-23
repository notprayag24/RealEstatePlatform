// src/pages/TestPage.jsx - Test API connection
import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const TestPage = () => {
  const [status, setStatus] = useState('Loading...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await apiClient.get('/health');
        setStatus('Connected ✅');
        setData(response.data);
      } catch (err) {
        setStatus('Error ❌');
        setError(err.message);
      }
    };
    testAPI();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-20">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          API Connection Test
        </h1>
        
        <div className="mb-4">
          <span className="font-semibold">Status: </span>
          <span className={`font-bold ${
            status === 'Connected ✅' ? 'text-green-600' : 
            status === 'Error ❌' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {status}
          </span>
        </div>

        {data && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-gray-700 mb-2">Response Data:</h2>
            <pre className="text-sm text-gray-600 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="font-semibold text-red-700 mb-2">Error:</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Retry Test
          </button>
          <a 
            href="/" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage;