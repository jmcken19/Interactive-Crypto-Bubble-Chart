import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchMarketData = async () => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 10,
        page: 1,
        sparkline: false,
      },
      headers: { 'x-cg-pro-api-key': API_KEY },
    });
    console.log("API response:", response.data); // <-- Add this line
    return response.data;
  } catch (error) {
    console.error("Error fetching market data:", error);
    return [];
  }
};