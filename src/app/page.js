'use client'
import { useState, useEffect } from "react";
import CryptoChart from "../components/CryptoChart";

export default function Home() {
  const [symbols, setSymbols] = useState([]); // List of all symbols
  const [filteredSymbols, setFilteredSymbols] = useState([]); // Filtered search results
  const [search, setSearch] = useState(""); // Search input value
  const [selectedSymbol, setSelectedSymbol] = useState("BTC"); // Selected symbol
  const [showDropdown, setShowDropdown] = useState(false); // Toggle for dropdown visibility

  useEffect(() => {
    // Fetch symbols from API on component mount
    const fetchSymbols = async () => {
      try {
        const response = await fetch(
          "https://min-api.cryptocompare.com/data/all/coinlist"
        );
        const data = await response.json();
        const symbolsArray = Object.keys(data.Data); // Extract all symbols
        setSymbols(symbolsArray);
      } catch (error) {
        console.error("Error fetching symbols:", error);
      }
    };

    fetchSymbols();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value.toUpperCase(); // Ensure case-insensitive search
    setSearch(query);

    if (query) {
      setShowDropdown(true);
      setFilteredSymbols(
        symbols.filter((symbol) => symbol.includes(query))
      );
    } else {
      setShowDropdown(false);
    }
  };

  // Handle symbol selection
  const handleSymbolClick = (symbol) => {
    setSelectedSymbol(symbol); // Update the selected symbol
    setShowDropdown(false); // Close the dropdown
    setSearch(""); // Clear the search input
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Crypto TradingView Chart</h1>
        
        {/* Search Input */}
        <input
          type="text"
          className="w-full p-2 mb-4 bg-gray-800 rounded-md text-white"
          placeholder="Search for a coin (e.g., BTC, ETH)"
          value={search}
          onChange={handleSearch}
        />

        {/* Dropdown List */}
        {showDropdown && (
          <div className="max-h-40 overflow-y-auto bg-gray-800 rounded-md p-2">
            {filteredSymbols.map((symbol) => (
              <button
                key={symbol}
                className="block w-full text-left p-2 rounded-md hover:bg-blue-500"
                onClick={() => handleSymbolClick(symbol)}
              >
                {symbol}
              </button>
            ))}
          </div>
        )}

        {/* Chart Display */}
        <CryptoChart symbol={selectedSymbol} />
      </div>
    </div>
  );
}

