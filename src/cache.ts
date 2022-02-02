import { createTimestamp, getCurrentTimeInSec } from "./utils";
import axios, { AxiosResponse } from "axios";
import {
  BaseEUR,
  BaseGBP,
  BaseUSD,
  CacheMap,
  Currency,
  CurrencyValue,
} from "./Components/App";
import { Dispatch, SetStateAction } from "react";
import _ from "lodash";

type EvictionPolicy = "Least Recently Used" | "Least Frequently Used";

export interface CacheConfig {
  size: number;
  dataNeedsRefreshingInSec: number;
  evictionPolicy: EvictionPolicy;
}

export class CurrencyCache {
  // Class properties
  cacheMap: CacheMap = new Map();
  cacheSize: number;
  dataNeedsRefreshingInSec: number;
  evictionPolicy: EvictionPolicy;

  constructor({ size, dataNeedsRefreshingInSec, evictionPolicy }: CacheConfig) {
    this.cacheSize = size;
    this.dataNeedsRefreshingInSec = dataNeedsRefreshingInSec;
    this.evictionPolicy = evictionPolicy;
  }

  static clone(oldCurrencyCache: CurrencyCache): CurrencyCache {
    let tempRef = new CurrencyCache({
      size: oldCurrencyCache.cacheSize,
      dataNeedsRefreshingInSec: oldCurrencyCache.dataNeedsRefreshingInSec,
      evictionPolicy: oldCurrencyCache.evictionPolicy,
    });

    tempRef.cacheMap = new Map(oldCurrencyCache.cacheMap);
    return tempRef;
  }

  fetchExchangeRate = (
    baseCurrency: Currency,
    setCache: Dispatch<SetStateAction<CurrencyCache>>
  ): void => {
    // Internal functions:
    const addDataToCache = (response: AxiosResponse<any>) => {
      for (const [key, value] of Object.entries(response.data)) {
        // If this.cacheMap is full (has 2 items), delete last item.
        if (this.cacheMap.size === this.cacheSize) {
          // ! is a non-null assertion operator
          const firstKeyInMap = Array.from(this.cacheMap)![0][0];
          this.cacheMap.delete(firstKeyInMap);
        }
        // Add new data to this.cacheMap.
        const currencyData = _.cloneDeep(response.data);
        currencyData.timestamp = createTimestamp();

        this.cacheMap.set(url, currencyData);
        console.log("Cache miss :( ", this.cacheMap);

        setCache(CurrencyCache.clone(this));
      }
    };

    const fetchDataAndUpdateCache = (): void => {
      const promise = axios.get(url);
      // promise.then((response) => addDataToCache(response));
      promise.then(addDataToCache);
    };

    // --------------------------

    const url = `http://45-79-65-143.ip.linodeusercontent.com:8082/${baseCurrency}`;
    const currencyInCache: CurrencyValue | undefined = this.cacheMap.get(url);

    if (currencyInCache) {
      const ageOfFetchedDataInSec = Math.floor(
        getCurrentTimeInSec() - currencyInCache.timestamp
      );
      if (ageOfFetchedDataInSec >= this.dataNeedsRefreshingInSec) {
        fetchDataAndUpdateCache.call(this);
      }

      // Delete from this.cacheMap and add to this.cacheMap again to reorder for LRU eviction policy.
      this.cacheMap.delete(`${url}`);
      console.log(`Cache after deletion: `);

      this.cacheMap.set(`${url}`, currencyInCache);
      setCache(CurrencyCache.clone(this));
      console.log("Cache should have been reordered");
      console.log("Cache hit :)");
    }

    if (!currencyInCache) fetchDataAndUpdateCache.call(this);
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
