import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import axios from "axios";

const TIMEFRAMES = {
  '1D': '1',
  '7D': '7',
  '1M': '30',
  '3M': '90',
  '1Y': '365',
  'MAX': 'max'
};

const AdvancedTradingChart = ({ coinId }) => {
  const chartContainerRef = useRef(null);
  const [timeframe, setTimeframe] = useState('30');
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('candles');
  const [showVolume, setShowVolume] = useState(true);
  
  useEffect(() => {
    const fetchData = async (retries = 3, delay = 2000) => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
          {
            params: { 
              vs_currency: "usd", 
              days: timeframe 
            },
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        );

        const volumeResponse = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
          {
            params: { 
              vs_currency: "usd", 
              days: timeframe 
            }
          }
        );

        // Format OHLC data
        const candleData = response.data.map(([time, open, high, low, close]) => ({
          time: time / 1000,
          open,
          high,
          low,
          close
        }));

        // Format volume data
        const volumeData = volumeResponse.data.total_volumes.map(([time, volume]) => ({
          time: time / 1000,
          value: volume
        }));

        if (chartContainerRef.current) {
          const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 600,
            layout: {
              background: { color: '#1F2937' },
              textColor: '#D1D5DB'
            },
            grid: {
              vertLines: { color: '#374151' },
              horzLines: { color: '#374151' }
            },
            crosshair: {
              mode: 'normal',
              vertLine: {
                width: 1,
                color: '#4B5563',
                style: 1,
                labelBackgroundColor: '#3B82F6',
              },
              horzLine: {
                width: 1,
                color: '#4B5563',
                style: 1,
                labelBackgroundColor: '#3B82F6',
              },
            },
            timeScale: {
              borderColor: '#4B5563',
              timeVisible: true,
              secondsVisible: false
            },
            rightPriceScale: { borderColor: '#4B5563' }
          });

          // Add main price series
          const mainSeries = chartType === 'candles' 
            ? chart.addCandlestickSeries({
                upColor: '#10B981',
                downColor: '#EF4444',
                borderUpColor: '#10B981',
                borderDownColor: '#EF4444',
                wickUpColor: '#10B981',
                wickDownColor: '#EF4444',
              })
            : chart.addLineSeries({
                color: '#3B82F6',
                lineWidth: 2,
              });

          mainSeries.setData(chartType === 'candles' ? candleData : 
            candleData.map(candle => ({
              time: candle.time,
              value: candle.close
            }))
          );

          // Add volume series
          if (showVolume) {
            const volumeSeries = chart.addHistogramSeries({
              color: '#6B7280',
              priceFormat: {
                type: 'volume',
              },
              priceScaleId: '',
              scaleMargins: {
                top: 0.8,
                bottom: 0,
              },
            });
            volumeSeries.setData(volumeData);
          }

          // Add SMA
          const sma20 = calculateSMA(candleData, 20);
          const smaSeries = chart.addLineSeries({
            color: '#F59E0B',
            lineWidth: 1,
            title: 'SMA 20',
          });
          smaSeries.setData(sma20);

          chart.timeScale().fitContent();

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
  }, [coinId, timeframe, chartType, showVolume]);

  const calculateSMA = (data, period) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
      sma.push({
        time: data[i].time,
        value: sum / period
      });
    }
    return sma;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {Object.entries(TIMEFRAMES).map(([label, value]) => (
            <button
              key={value}
              onClick={() => setTimeframe(value)}
              className={`px-3 py-1 rounded ${
                timeframe === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex space-x-4">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="bg-gray-700 text-gray-300 rounded px-3 py-1"
          >
            <option value="candles">Candlesticks</option>
            <option value="line">Line</option>
          </select>
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              checked={showVolume}
              onChange={(e) => setShowVolume(e.target.checked)}
              className="mr-2"
            />
            Show Volume
          </label>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}
      
      <div 
        ref={chartContainerRef} 
        className="w-full h-[600px] rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default AdvancedTradingChart;