import { createTimestamp, getCurrentTimeInSec } from "./utils";
import axios, { AxiosResponse } from "axios";
import { Dispatch, SetStateAction } from "react";
import _ from "lodash";

export type Currency = "USD" | "EUR" | "GBP" | "CAD";

export interface BaseUSD {
  timestamp: number;
  lastAccessTime: number;
  popularity: number;
  USD: Partial<Record<Currency, number>>;
  // USD: Partial<{ [P in Currency]: number }>;
}

export interface BaseEUR {
  timestamp: number;
  lastAccessTime: number;
  popularity: number;
  EUR: Partial<Record<Currency, number>>;
}

export interface BaseGBP {
  timestamp: number;
  lastAccessTime: number;
  popularity: number;
  GBP: Partial<Record<Currency, number>>;
}

export interface BaseCAD {
  timestamp: number;
  lastAccessTime: number;
  popularity: number;
  CAD: Partial<Record<Currency, number>>;
}

export type CurrencyValue = BaseUSD | BaseEUR | BaseGBP | BaseCAD;

export type URL = string;

export type CacheMap = Map<URL, CurrencyValue>;

export type EvictionPolicy = "Least Recently Used" | "Least Frequently Used";

export interface CacheConfig {
  maxCacheSize: number;
  dataNeedsRefreshingInSec: number;
  evictionPolicy: EvictionPolicy;
}

export class CurrencyCache {
  cacheMap: CacheMap = new Map();
  cacheSize: number;
  dataNeedsRefreshingInSec: number;
  evictionPolicy: EvictionPolicy;

  constructor({
    maxCacheSize,
    dataNeedsRefreshingInSec,
    evictionPolicy,
  }: CacheConfig) {
    this.cacheSize = maxCacheSize;
    this.dataNeedsRefreshingInSec = dataNeedsRefreshingInSec;
    this.evictionPolicy = evictionPolicy;
  }

  static clone(oldCurrencyCache: CurrencyCache): CurrencyCache {
    let tempRef = new CurrencyCache({
      maxCacheSize: oldCurrencyCache.cacheSize,
      dataNeedsRefreshingInSec: oldCurrencyCache.dataNeedsRefreshingInSec,
      evictionPolicy: oldCurrencyCache.evictionPolicy,
    });

    tempRef.cacheMap = new Map(oldCurrencyCache.cacheMap);
    return tempRef;
  }

  // TODO: I think there should be a method to check if the data exists in the CurrencyCache and if it's out of date first. 
  // Then if data needs to be fetched first time or if the data is out of date, then fetch the data
  // calling the fetchCurrencyData method.

  // getCurrency = (baseCurrency: URL): CurrencyValue  => { 
  //   if (!this.cacheMap.has(baseCurrency)) { 
  //     this.fetchExchangeRate(baseCurrency: URL, setCache);
  //   }

  //   return this.cacheMap.get(baseCurrency)!;
  // }

  fetchExchangeRate = (
    baseCurrency: Currency,
    setCache: Dispatch<SetStateAction<CurrencyCache>>
  ): void => {
    // Internal functions:
    const addDataToCache = (response: AxiosResponse<any>) => {
      const evictLeastRecentlyUsed = () => {
        // Sort the array based on lastAccessTime (largest to smallest) and delete the first.
        const casheArray = Array.from(this.cacheMap);
        // Sort by lastAccessTime in ascending order (smallest to largest)
        casheArray.sort((a, b) => a[1].lastAccessTime - b[1].lastAccessTime);
        const firstElementInCacheArray = casheArray[0][0];
        this.cacheMap.delete(firstElementInCacheArray);
      };

      const evictLeastFrequentlyUsed = () => {
        const cacheArray = Array.from(this.cacheMap);
        cacheArray.sort((a, b) => a[1].popularity - b[1].popularity);
        const firstElementInCacheArray = cacheArray[0][0];
        this.cacheMap.delete(firstElementInCacheArray);
      };

      // Check if cache is full.
      if (this.cacheMap.size === this.cacheSize) {
        switch (this.evictionPolicy) {
          case "Least Frequently Used":
            evictLeastFrequentlyUsed();
            break;
          case "Least Recently Used":
            evictLeastRecentlyUsed();
            break;
        }
      }

      // Defensively deep copy data which comes back from Axios call.
      const currencyData = _.cloneDeep(response.data);
      currencyData.timestamp = createTimestamp();
      currencyData.lastAccessTime = createTimestamp();
      currencyData.popularity = 1;
      this.cacheMap.set(url, currencyData);
      console.log("Cache miss :( ", this.cacheMap);

      // This will trigger React to rerender the UI.
      setCache(CurrencyCache.clone(this));
    };

    const fetchDataAndUpdateCache = (): void => {
      const promise = axios.get(url);
      // promise.then((response) => addDataToCache(response));
      promise.then(addDataToCache);
    };

    // End of internal functions

    const url = `http://45-79-65-143.ip.linodeusercontent.com:8082/${baseCurrency}`;
    const currencyInCache: CurrencyValue | undefined = this.cacheMap.get(url);

    if (currencyInCache) {
      const ageOfFetchedDataInSec = Math.floor(
        getCurrentTimeInSec() - currencyInCache.timestamp
      );
      // Refresh the data if it's out of date.
      if (ageOfFetchedDataInSec >= this.dataNeedsRefreshingInSec) {
        fetchDataAndUpdateCache();
        return;
      }

      // Update the eviction policy info when data is fresh in cache.
      switch (this.evictionPolicy) {
        case "Least Recently Used":
          // Populate a new lastAccessTime for the data that was requested.
          currencyInCache.lastAccessTime = createTimestamp();
          console.log("Cache hit :)");
          console.log("Currency in cache hit: ", currencyInCache);
          setCache(CurrencyCache.clone(this));
          break;
        case "Least Frequently Used":
          // Update the popularity value of the data requested.
          currencyInCache.popularity += 1;
          console.log("Cache hit :)");
          console.log("Currency in cache hit: ", currencyInCache);
          setCache(CurrencyCache.clone(this));
          break;
      }
    }

    if (!currencyInCache) fetchDataAndUpdateCache();
  };
}

// export const cache = new Map();
//
// export function fetchExchangeRate(
//   cache: Map<any, any>,
//   setCache: Dispatch<SetStateAction<any>>,
//   baseCurrency: Currency,
//   dataNeedsRefreshingInSec: number
// ): void {
//   const url = `http://45-79-65-143.ip.linodeusercontent.com:8082/${baseCurrency}`;
//   const currencyInCache = cache.get(url);
//
//   if (currencyInCache) {
//     const ageOfFetchedDataInSec = Math.floor(
//       getCurrentTimeInSec() - currencyInCache.timestamp
//     );
//     if (ageOfFetchedDataInSec >= dataNeedsRefreshingInSec) {
//       fetchDataAndUpdateCache(url);
//     }
//     // Save the URL and the value first, so that we can add it back to cache.
//     const requestedData = cache.get(url);
//     // Delete from cache and add to cache again to reorder for LRU eviction policy.
//     cache.delete(`${url}`);
//     console.log(`Cache after deletion: `);
//     cache.set(`${url}`, requestedData);
//     const mapWithNewReference = new Map(cache);
//     setCache(mapWithNewReference);
//     console.log("Cache should have been reordered");
//     console.log("Cache hit :)");
//   }
//
//   if (!currencyInCache) {
//     fetchDataAndUpdateCache(url);
//   }
//
//   function fetchDataAndUpdateCache(url: string) {
//     const promise = axios.get(url);
//     promise.then((response) => addDataToCache(url, response));
//   }
//
//   function addDataToCache(url: string, response: AxiosResponse<any>) {
//     const maxItemsInCache = 2;
//     for (const [key, value] of Object.entries(response.data)) {
//       // If cache is full (has 2 items), delete last item.
//       if (cache.size === maxItemsInCache) {
//         // ! is a non-null assertion operator
//         const firstKeyInMap = Array.from(cache)![0][0];
//         cache.delete(firstKeyInMap);
//       }
//       // Add new data to cache.
//       cache.set(url, {
//         timestamp: createTimestamp(),
//         [key]: value,
//       });
//       console.log("Cache miss :( ", cache);
//
//       const mapWithNewReference = new Map(cache);
//       setCache(mapWithNewReference);
//     }
//   }
// }
