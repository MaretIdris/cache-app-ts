// I am making an app that fetches data from an API and adds it to cache.
// I will write a test. If request for data comes in:
// 1. Check is this data available in cache. If it is, check is the data
// still fresh by checking the timestamp. The data must be newer than 24 hours old.

// DON'T DO THIS:
// I could write a code where if the data gets out of date, it automatically fetches
// fresh data. This might be lossy and expensive, since there might be nobody
// requesting this data.

// DO THIS:
// Another option is to listen for some kind of event like page load, onClick, then
// first check the cache (cache needs to be made when the application first runs).
//    1. If the data is in the cache && the data is not out of date, the give the data
// whoever requested it.
//    2. If the data is in the cache && out of date, fetch for new data, then give the
// data whoever requested it.
//    3. If data in not in the cache, fetch the data and add it to cache, then give the
// data whoever requested it.

// Let's say that I have a window open and it's displaying the data. What is the data
// goes out of date, but in my UI I had already fetched it before and it's not updating
// since there is no event to trigger a new data check???!!!
// What do I do then?
// Can I write code that checks if browser tab is active and data timestamp is out of
// date, then I will fetch for new data?

import axios from "axios";

const fetchCurrencyData = async (baseCurrency: string) => {
  // Fetch the data from my HTTP server
  const url = `http://45-79-65-143.ip.linodeusercontent.com:8082/${baseCurrency}`;
  // const url = `http://localhost:8082/${baseCurrency}`;
  // await immediately returns Response object.
  const data = await axios.get(url);
  console.log(data.data);
  // console.log(data.data)
};

export { fetchCurrencyData };

// const fetchCurrencyData = async () => {
//   // Fetch the data from my HTTP server
//   const url = "http://45-79-65-143.ip.linodeusercontent.com:8082/USD"
//   const payloadPromise = await fetch(url)
//   console.log(payloadPromise)
//
// }
