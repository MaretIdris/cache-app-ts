import _ from "lodash";
import {
  CurrencyCacheArgs,
  CurrencyCacheInterface,
  CurrencyName,
  TargetCurrencies,
} from "./external";

/* We want our data to look like: Map<CurrencyName, TargetCurrencies>
{
  baseCurrency1: {
    timestamp: number
    targetCurrency1: {
     "code": string
     "value": number
    }
    targetCurrency2: {
     "code": string
     "value": number     
    }
  }
  baseCurrency2: {
    timestamp: number
    targetCurrency1: {
     "code": string
     "value": number
    }
    targetCurrency3: {
     "code": string
     "value": number
    }
  }
  ...
}
-----------------------------------------------------------------------
The data that we get from the API is in the following format:

// Request with base currency set to USD:
https://api.currencyapi.com/v3/latest?apikey={apikey}&currencies=CAD%2CEUR&base_currency=USD

BaseCurrency USD:

{
  "meta": {
    "last_updated_at": "2022-11-30T23:59:59Z"
  },
  "data": {
    "CAD": {
      "code": "CAD",
      "value": 1.341371
    },
    "EUR": {
      "code": "EUR",
      "value": 0.959362
    }
  }
}
*/

class CurrencyCache implements CurrencyCacheInterface {
  evictionPolicy: "Least Recently Used" | "Least Frequently Used" =
    "Least Recently Used";
  maxSize: number = 2;
  dataTimeWindowInSeconds: number = 60;
  allCurrencies = ["USD", "EUR", "CAD", "GBP"];
  cache: Map<CurrencyName, TargetCurrencies> = new Map();
  currencyPopularity = new Map<CurrencyName, number>();

  constructor({
    evictionPolicy,
    maxSize,
    dataTimeWindowInSeconds,
  }: CurrencyCacheArgs) {
    if (evictionPolicy) {
      this.evictionPolicy = evictionPolicy;
    }
    if (maxSize) {
      this.maxSize = maxSize;
    }
    if (dataTimeWindowInSeconds) {
      this.dataTimeWindowInSeconds = dataTimeWindowInSeconds;
    }
  }

  getTargetCurrencies = async (
    baseCurrency: CurrencyName
  ): Promise<TargetCurrencies> => {
    /* 
    - Check does the cache has the baseCurrency
         - If yes, check is the data fresh (data is fresh when the time the previous data was fetched minus current time is less then dataTimeWindowInSeconds)
               - If yes, RETURN the baseCurrency
         Data is not fresh:🟠fetch the fresh data, clean it up, add it to cache. If evictionPolicy is LRU update _currencyPopularity, RETURN the baseCurrency from the cache.-- 🟠

    - If the cache is full, make space for the new baseCurrency.
         - If yes, based on the eviction policy, remove currency from the cache.
              - If the evictionPolicy is LRU, 
                    - Remove the first entry from the cache Map.
              - If the evictionPolicy is LFU,
                    - Convert the _currencyPopularity Map to array. Sort the array in ascending order. Get the first currency from the array. Remove that currency from the cache. Set that currency popularity to 0 (reset it).
        
    - Cache doesn't have the baseCurrency and cache has space: 🟠fetch the baseCurrency data, clean it up, add it to cache. If evictionPolicy is LRU update _currencyPopularity, RETURN the baseCurrency from the cache.-- 🟠
    */

    const currentTimeStampInSec = this.generateTimestampInSec();

    if (this.cache.has(baseCurrency)) {
      // check the timestamp.
      const baseCurrencyTimestampInSec =
        this.cache.get(baseCurrency)!.timestamp;
      const timeDifferenceInSec =
        currentTimeStampInSec - baseCurrencyTimestampInSec;
      if (timeDifferenceInSec < this.dataTimeWindowInSeconds) {
        // Data is fresh.
        return this.cache.get(baseCurrency)!;
      }

      // Data is not fresh.
      return await this.fetchAndSanitizeData(
        baseCurrency,
        currentTimeStampInSec
      );
    }

    // Cache is full. Remove a currency from the cache to make space for the baseCurrency.
    if (this.cache.size === this.maxSize) {
      if (this.evictionPolicy === "Least Recently Used") {
        // Remove the first entry from the cache Map.
        const firstCurrencyInCache = this.cache.keys().next().value;
        this.cache.delete(firstCurrencyInCache);
      } else if (this.evictionPolicy === "Least Frequently Used") {
        // Sort the _currencyPopularity Map. Least to most used (ascending order).
        /* Example of a currencyPopularity Map.
          {
            "USD": 2,
            "EUR": 1,
            "CAD": 1,
          }
          Converted to array: [["USD", 2], ["EUR", 1], ["CAD", 1]]
           */
        const sortedPopularityArray = [...this.currencyPopularity].sort(
          (a, b) => a[1] - b[1]
        );
        const leastFrequentlyUsedCurrency = sortedPopularityArray[0][0];
        // Then delete least frequently used currency from the cache and reset it's value to 0 in _currencyPopularity Map.
        this.cache.delete(leastFrequentlyUsedCurrency);
        this.resetCurrencyPopularityToZero(leastFrequentlyUsedCurrency);
      }
    }

    return await this.fetchAndSanitizeData(baseCurrency, currentTimeStampInSec);
  };

  fetchAndSanitizeData = async (
    baseCurrency: CurrencyName,
    currentTimeStamp: number
  ) => {
    const targetCurrencies = await this.fetchData(baseCurrency);
    /* Data that comes back as a response from the API is shaped like this:
    {
      "data": Object {
          "CAD": Object {
            "code": "CAD",
            "value": 1.343457,
          },
          "EUR": Object {
            "code": "EUR",
            "value": 0.949874,
          },
          "GBP": Object {
            "code": "GBP",
            "value": 0.815737,
          },
        },
        "meta": Object {
          "last_updated_at": "2022-12-01T23:59:59Z",
        },
    }
     */
    this.addTimeStampAndAddCurrencyToCache(
      baseCurrency,
      targetCurrencies,
      currentTimeStamp
    );

    if (this.evictionPolicy === "Least Frequently Used") {
      this.incrementCurrencyPopularity(baseCurrency);
    }

    return this.cache.get(baseCurrency)!;
  };

  /** Keeping the data fetching function simple. It only fetches data. */
  fetchData = async (baseCurrency: string) => {
    // Make a request to the API and return the result.
    const apiKey = "ZVuvaZFlVxMQOVyvtlvH0CmDBMMKQd6SB6FPvfeR"; // <- Add your API key here. You can get it from https://www.currencyconverterapi.com/
    const currenciesToFetch = this.allCurrencies
      .filter((currency) => currency !== baseCurrency)
      .join("%2C");
    const url = `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=${currenciesToFetch}&base_currency=${baseCurrency}`;
    const response = await fetch(url);
    const result = await response.json();
    return result;
  };

  incrementCurrencyPopularity = (baseCurrency: CurrencyName) => {
    if (this.currencyPopularity.has(baseCurrency)) {
      const popularity = this.currencyPopularity.get(baseCurrency)!;
      this.currencyPopularity.set(baseCurrency, popularity + 1);
    } else {
      this.currencyPopularity.set(baseCurrency, 1);
    }
  };

  /** If currency is removed from the cache, set it's popularity count to zero. */
  resetCurrencyPopularityToZero = (baseCurrency: CurrencyName) => {
    this.currencyPopularity.set(baseCurrency, 0);
  };

  addTimeStampAndAddCurrencyToCache = (
    baseCurrency: CurrencyName,
    dirtyTargetCurrencies: any,
    timestamp: number
  ) => {
    const { data } = dirtyTargetCurrencies;
    /* After destructuring data out of dirtyTargetCurrencies, the data looks like this:
    {
      CAD: { code: 'CAD', value: 1.343457 },
      EUR: { code: 'EUR', value: 0.949874 },
      GBP: { code: 'GBP', value: 0.815737 }
    }
    We add timestamp to it and add it to the cache.
    */
    const currencyDataCopy = _.cloneDeep(data);
    this.cache.set(baseCurrency, { ...currencyDataCopy, timestamp }); // Could also write Object.assign({}, currencyDataCopy, { timestamp })
  };

  generateTimestampInSec = () => {
    return Date.now() * 1000;
  };
}

export default CurrencyCache;
