import apiKeys from "../config/apiKeys";

export async function fetchCryptoData(symbol) {
  const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=30&api_key=${apiKeys.CRYPTO_COMPARE}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.Data.Data;
}
