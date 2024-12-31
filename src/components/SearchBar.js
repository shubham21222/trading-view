import React, { useState } from "react";
import axios from "axios";

const SearchBar = ({ onCoinSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [coins, setCoins] = useState([]);

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 2) {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/search?query=${e.target.value}`
      );
      setCoins(response.data.coins);
    } else {
      setCoins([]);
    }
  };

  const handleSelect = (coin) => {
    setSearchTerm("");
    setCoins([]);
    onCoinSelect(coin);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search Cryptocurrency..."
        className="border p-2 w-full rounded"
      />
      {coins.length > 0 && (
        <ul className="absolute bg-white border rounded w-full max-h-60 overflow-y-auto">
          {coins.map((coin) => (
            <li
              key={coin.id}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect(coin)}
            >
              {coin.name} ({coin.symbol.toUpperCase()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
