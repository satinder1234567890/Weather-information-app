import { useState } from 'react';

export default function WeatherForm({ onSubmit, loading }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md flex space-x-3">
      <input
        type="text"
        placeholder="Enter city name"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
        className="flex-grow border border-gray-300 rounded shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="City name"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded px-6 py-2 transition"
      >
        {loading ? 'Loading...' : 'Get Weather'}
      </button>
    </form>
  );
}
