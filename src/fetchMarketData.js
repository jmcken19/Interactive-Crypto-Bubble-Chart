import axios from "axios";

// The "API Layer"

// API and URL for variables
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
// this will fetch the top 10 coins by market cap and return the data
// in an array
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
      // the header passes the apio key, without it and depending on the api it could get rejected
     // this api call is free so it wont get rejected if removed
    });
    //passing params object looks like a url when placed togehter,
    // it is converted into a query string and appended to the url, so the final url looks like this:
    // https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false
    // the headers object is used to pass the api key to the server, so that it can be authenticated and authorized to access the data.
    // logs the response in the console for convenience for me
    console.log("API response:", response.data);
    return response.data;
    // catch any errors and send them to the console for debugging
  } catch (error) {
    console.error("Error fetching market data:", error);
    return [];
  }
};