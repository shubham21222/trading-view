import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import axios from "axios";

const TradingViewChart = ({ coinId }) => {
  const chartContainerRef = useRef(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async (retries = 3, delay = 2000) => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
          {
            params: { vs_currency: "usd", days: 30 },
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            }
          }
        );

        const prices = response.data.prices.map(([timestamp, price]) => ({
          time: Math.floor(timestamp / 1000),
          value: price,
        }));

        if (chartContainerRef.current) {
          const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: { 
              background: { color: '#1F2937' },
              textColor: '#D1D5DB'
            },
            grid: {
              vertLines: { color: '#374151' },
              horzLines: { color: '#374151' }
            },
            timeScale: { borderColor: '#4B5563' },
            priceScale: { borderColor: '#4B5563' },
          });

          const lineSeries = chart.addLineSeries({
            color: '#3B82F6',
            lineWidth: 2,
          });
          lineSeries.setData(prices);

          const handleResize = () => {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth
            });
          };

          window.addEventListener('resize', handleResize);

          return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
          };
        }
      } catch (error) {
        if (error.response?.status === 429 && retries > 0) {
          setError(`Rate limit reached. Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchData(retries - 1, delay * 2);
        }
        setError("Failed to load chart data. Please try again later.");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [coinId]);

  return (
    <div>
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}
      <div 
        ref={chartContainerRef} 
        className="w-full h-[400px] rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default TradingViewChart;