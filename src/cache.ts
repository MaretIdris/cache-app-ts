import { createTimestamp, getCurrentTimeInSec } from "./utils";
import axios, { AxiosResponse } from "axios";
import { Currency } from "./App";
import { Dispatch, SetStateAction } from "react";

// Eviction policies: leastRecentyUsed (LRU) and leastFrequentlyUsed

// const cacheConfig = {
//   cache
//   dataNeedsRefreshInSec: 86400,
//   evictionPolicy:
//
// }

// When I make a Cache specify the config options: size, when to refresh data, eviction policy

export function fetchExchangeRate(
  cache: Map<any, any>,
  setCache: Dispatch<SetStateAction<any>>,
  baseCurrency: Currency,
  dataNeedsRefreshingInSec: number
): void {
  const url = `http://45-79-65-143.ip.linodeusercontent.com:8082/${baseCurrency}`;
  const currencyInCache = cache.get(url);

  if (!currencyInCache) {
    fetchDataAndUpdateCache(url);
  } else if (currencyInCache) {
    const ageOfFetchedDataInSec = Math.floor(
      getCurrentTimeInSec() - currencyInCache.timestamp
    );
    if (ageOfFetchedDataInSec >= dataNeedsRefreshingInSec) {
      fetchDataAndUpdateCache(url);
    }
    console.log("Cache hit :)");
  }

  function fetchDataAndUpdateCache(url: string) {
    const promise = axios.get(url);
    promise.then((response) => addDataToCache(url, response));
  }

  function addDataToCache(url: string, response: AxiosResponse<any>) {
    const maxItemsInCache = 2;
    for (const [key, value] of Object.entries(response.data)) {
      // If cache is full (has 2 items), delete last item.
      if (cache.size === maxItemsInCache) {
        // ! is a non-null assertion operator
        const firstKeyInMap = Array.from(cache)![0][0];
        cache.delete(firstKeyInMap);
      }
      // Add new data to cache.
      cache.set(url, {
        timestamp: createTimestamp(),
        [key]: value,
      });
      console.log("Cache miss :( ", cache);

      const mapWithNewReference = new Map(cache);
      setCache(mapWithNewReference);
    }
  }
}
