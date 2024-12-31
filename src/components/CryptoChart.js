import React, { useState, useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const CryptoChart = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (selectedCoin) {
      fetchChartData();
    }
  }, [selectedCoin]);

  const searchCoins = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${query}`
      );
      const data = await response.json();
      setSuggestions(data.coins.slice(0, 5));
    } catch (error) {
      console.error("Error searching coins:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/market_chart?vs_currency=usd&days=30`
      );
      const data = await response.json();
      
      const prices = data.prices.map(([timestamp, price]) => ({
        time: timestamp / 1000,
        value: price,
      }));

      if (chartRef.current) {
        chartRef.current.remove();
      }

      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: { backgroundColor: "#ffffff", textColor: "#000000" },
        grid: { vertLines: { color: "#e1e1e1" }, horzLines: { color: "#e1e1e1" } },
        timeScale: { borderColor: "#cccccc" },
        priceScale: { borderColor: "#cccccc" },
      });

      const lineSeries = chartRef.current.addLineSeries({
        color: "#2196F3",
        lineWidth: 2,
      });
      lineSeries.setData(prices);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Crypto Chart Viewer</h1>
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search cryptocurrency (e.g., Bitcoin)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              searchCoins(e.target.value);
            }}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1">
              {suggestions.map((coin) => (
                <div
                  key={coin.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => {
                    setSelectedCoin(coin);
                    setSearchTerm(coin.name);
                    setSuggestions([]);
                  }}
                >
                  <img src={coin.thumb} alt={coin.name} className="w-6 h-6 mr-2" />
                  <span>{coin.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6" ref={chartContainerRef} />
    </div>
  );
};

export default CryptoChart;