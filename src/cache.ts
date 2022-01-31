import { createTimestamp, getCurrentTimeInSec } from "./utils";
import axios, { AxiosResponse } from "axios";
import { Currency } from "./App";
import { Dispatch, SetStateAction } from "react";

// export const cache = new Map();

export function doSomething(
  cache: Map<any, any>,
  setCache: Dispatch<SetStateAction<any>>,
  baseCurrency: Currency
): void {
  const url = `http://45-79-65-143.ip.linodeusercontent.com:8082/${baseCurrency}`;
  const currencyObjInCache = cache.get(url);
  if (!currencyObjInCache) {
    fetchDataAndUpdateCache(url);
  } else if (currencyObjInCache) {
    const ageOfFetchedDataInSec = Math.floor(
      getCurrentTimeInSec() - currencyObjInCache.timestamp
    );
    const dayInSec = 86400;
    const dataIsOlderThanOneDay = ageOfFetchedDataInSec >= dayInSec;
    if (dataIsOlderThanOneDay) {
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
        const lastElement = Array.from(cache).pop()!;
        cache.delete(lastElement[0]);
      }
      // Add new data to cache.
      cache.set(url, {
        timestamp: createTimestamp(),
        [key]: value,
      });
      console.log("Cache miss :( ", cache);
      const newMap = new Map(cache);
      console.log("New Map ==========", newMap);
      setCache(newMap);
    }
  }
}
