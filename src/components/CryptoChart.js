import { useEffect, useRef } from "react";

const CryptoChart = ({ symbol }) => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    // Dynamically load the TradingView library if it's not already loaded
    const loadTradingViewScript = () => {
      return new Promise((resolve) => {
        if (window.TradingView) {
          resolve(); // The script is already loaded
        } else {
          const script = document.createElement("script");
          script.src = "https://s3.tradingview.com/tv.js";
          script.onload = resolve; 
          document.head.appendChild(script);
        }
      });
    };

    // Initialize the TradingView widget
    const initializeWidget = async () => {
      await loadTradingViewScript();

      if (chartContainerRef.current) {
        // Clear previous chart if any
        chartContainerRef.current.innerHTML = "";

        new window.TradingView.widget({
          container_id: chartContainerRef.current.id,
          width: "100%",
          height: 600,
          symbol: `BINANCE:${symbol}USDT`, // Example: BTCUSDT
          interval: "D", // Daily interval
          theme: "dark",
          style: "1", // Candle chart
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: false,
          hide_side_toolbar: false,
        });
      }
    };

    initializeWidget();
  }, [symbol]); // Reinitialize the chart whenever the symbol changes

  return (
    <div
      ref={chartContainerRef}
      id="tradingview-chart"
      className="tradingview-chart-container"
    ></div>
  );
};

export default CryptoChart;
