'use client'
import React, { useState } from "react";
import AdvancedTradingChart from "../components/AdvancedTradingChart";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState("");

  const searchCoins = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const data = await response.json();
      setSuggestions(data.coins.slice(0, 5));
    } catch (error) {
      console.error("Error searching coins:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          Crypto Chart Viewer
        </h1>
        
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search cryptocurrency (e.g., Bitcoin)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchCoins(e.target.value);
              }}
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition duration-200"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 
                            rounded-lg mt-2 shadow-xl overflow-hidden">
                {suggestions.map((coin) => (
                  <div
                    key={coin.id}
                    className="p-4 hover:bg-gray-700 cursor-pointer flex items-center
                               transition duration-200 border-b border-gray-700 last:border-0"
                    onClick={() => {
                      setSelectedCoin(coin.id);
                      setSearchTerm(coin.name);
                      setSuggestions([]);
                    }}
                  >
                    <img src={coin.thumb} alt={coin.name} className="w-8 h-8 mr-3 rounded-full" />
                    <span className="text-white">{coin.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          {selectedCoin ? (
            <AdvancedTradingChart coinId={selectedCoin} />
          ) : (
            <div className="bg-gray-800 rounded-xl p-20">
              <p className="text-center text-gray-400 text-lg">
                Search for a cryptocurrency to view its chart
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}