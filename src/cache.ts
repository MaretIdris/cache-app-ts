import { createTimestamp, getCurrentTimeInSec } from "./utils";
import axios, { AxiosResponse } from "axios";
import { Currency } from "./App";

export function doSomething(
  tempCache: Map<any, any>,
  baseCurrency: Currency
): void {
  const url = `http://45-79-65-143.ip.linodeusercontent.com:8082/${baseCurrency}`;
  const currencyObjInCache = tempCache.get(url);
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
      if (tempCache.size === maxItemsInCache) {
        // ! is a non-null assertion operator
        const lastElement = Array.from(tempCache).pop()!;
        tempCache.delete(lastElement[0]);
      }
      // Add new data to cache.
      tempCache.set(url, {
        timestamp: createTimestamp(),
        [key]: value,
      });
      console.log("Cache miss :( ", tempCache);
    }
  }
}