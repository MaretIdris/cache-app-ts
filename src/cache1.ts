import _ from "lodash";

export interface CurrencyCacheInterface {
  /** The order of removing the results from the cache when cache is full. */
  evictionPolicy: "Least Recently Used" | "Least Frequently Used";
  /** Indicates the maximum number of items we can store in the cache. After this number we will start purging results from the cache. */
  maxSize: number;
  /** Time window in seconds after data is old and needs to be fetched again.  */
  dataTimeWindowInSeconds: number;
  /** Returns all the targetCurrencies conversions */
  getCurrency?: (baseCurrency: CurrencyName) => BaseCurrencyConversionsTo;
  /** Return target currency value as number. */
  // convert: (baseCurrency: string, targetCurrency: string) => number;
  fetchData?: (baseCurrency: CurrencyName) => Promise<any>;
}

type CurrencyName = "USD" | "EUR" | "CAD" | "GBP";
interface CurrencyInfo {
  code: CurrencyName;
  value: number;
}
// Intersection type.
type Timestamp = { timestamp: number };
// Partial makes all properties in the type passed to it optional and that's what we want.
type BaseCurrencyConversionsTo = Timestamp &
  Partial<Record<CurrencyName, CurrencyInfo>>;

/* We want our data to look like: Map<CurrencyName, BaseCurrencyConversionsTo>
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
*/

class CurrencyCache {
  evictionPolicy: "Least Recently Used" | "Least Frequently Used" =
    "Least Recently Used";
  maxSize: number = 2;
  dataTimeWindowInSeconds = 60;
  private _allCurrencies = ["USD", "EUR", "CAD", "GBP"];
  private _cache: Map<CurrencyName, BaseCurrencyConversionsTo> = new Map();
  private _currencyPopularity = new Map<CurrencyName, number>();

  constructor({
    evictionPolicy,
    maxSize,
    dataTimeWindowInSeconds,
  }: CurrencyCacheInterface) {
    this.evictionPolicy = evictionPolicy;
    this.maxSize = maxSize;
    this.dataTimeWindowInSeconds = dataTimeWindowInSeconds;
  }

  getCurrency = (baseCurrency: CurrencyName): BaseCurrencyConversionsTo => {
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

    const currentTimeStampInSec = this._generateTimestampInSec();

    if (this._cache.has(baseCurrency)) {
      // check the timestamp.
      const baseCurrencyTimestampInSec =
        this._cache.get(baseCurrency)!.timestamp;
      const timeDifferenceInSec =
        currentTimeStampInSec - baseCurrencyTimestampInSec;
      if (timeDifferenceInSec < this.dataTimeWindowInSeconds) {
        // Data is fresh.
        return this._cache.get(baseCurrency)!;
      }

      // Data is not fresh.
      this._fetchAndSanitizeData(baseCurrency, currentTimeStampInSec);
    }

    // Cache is full. Remove a currency from the cache to make space for the baseCurrency.
    if (this._cache.size === this.maxSize) {
      if (this.evictionPolicy === "Least Recently Used") {
        // Remove the first entry from the cache Map.
        const firstCurrencyInCache = this._cache.keys().next().value;
        this._cache.delete(firstCurrencyInCache);
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
        const sortedPopularityArray = [...this._currencyPopularity].sort(
          (a, b) => a[1] - b[1]
        );
        const leastFrequentlyUsedCurrency = sortedPopularityArray[0][0];
        // Then delete least frequently used currency from the cache and reset it's value to 0 in _currencyPopularity Map.
        this._cache.delete(leastFrequentlyUsedCurrency);
        this._resetCurrencyPopularityToZero(leastFrequentlyUsedCurrency);
      }
    }

    return this._fetchAndSanitizeData(baseCurrency, currentTimeStampInSec);
  };

  private _fetchAndSanitizeData = (
    baseCurrency: CurrencyName,
    currentTimeStamp: number
  ) => {
    const targetCurrencies = this.fetchData(baseCurrency);
    this._addTimeStampAndAddCurrencyToCache(
      baseCurrency,
      targetCurrencies,
      currentTimeStamp
    );

    if (this.evictionPolicy === "Least Recently Used") {
      this._incrementCurrencyPopularity(baseCurrency);
    }

    return this._cache.get(baseCurrency)!;
  };

  /** Keeping the data fetching function simple. It only fetches data. */
  fetchData = async (baseCurrency: string) => {
    // Make a request to the API and return the result.
    const apiKey = "ZVuvaZFlVxMQOVyvtlvH0CmDBMMKQd6SB6FPvfeR"; // <- Add your API key here. You can get it from https://www.currencyconverterapi.com/
    const currenciesToFetch = this._allCurrencies
      .filter((currency) => currency !== baseCurrency)
      .join("%2C");
    const url = `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=${currenciesToFetch}&base_currency=${baseCurrency}`;
    const response = await fetch(url);
    const result = await response.json();
    return result;
  };

  private _incrementCurrencyPopularity = (baseCurrency: CurrencyName) => {
    if (this._currencyPopularity.has(baseCurrency)) {
      const popularity = this._currencyPopularity.get(baseCurrency)!;
      this._currencyPopularity.set(baseCurrency, popularity + 1);
    } else {
      this._currencyPopularity.set(baseCurrency, 1);
    }
  };

  /** If currency is removed from the cache, set it's popularity count to zero. */
  private _resetCurrencyPopularityToZero = (baseCurrency: CurrencyName) => {
    this._currencyPopularity.set(baseCurrency, 0);
  };

  private _addTimeStampAndAddCurrencyToCache = (
    baseCurrency: CurrencyName,
    data: any,
    timestamp: number
  ) => {
    const { data: currencyData } = data;
    const currencyDataCopy = _.cloneDeep(currencyData);
    this._cache.set(baseCurrency, { ...currencyDataCopy, timestamp }); // Could also write Object.assign({}, currencyDataCopy, { timestamp })
  };

  private _generateTimestampInSec = () => {
    return Date.now() * 1000;
  };
}

export default CurrencyCache;

/* 
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
---------------------------

// Request with base currency set to EUR:
https://api.currencyapi.com/v3/latest?apikey={apikey}&currencies=CAD%2CUSD&base_currency=EUR

BaseCurrency EUR:
{
  "meta": {
    "last_updated_at": "2022-11-30T23:59:59Z"
  },
  "data": {
    "CAD": {
      "code": "CAD",
      "value": 1.398191
    },
    "USD": {
      "code": "USD",
      "value": 1.042359
    }
  }
}

---------------------------------------------------------------------------------

DATA SANITIZATION EXERCISE:

BaseCurrency USD:
{
  "meta": {
    "last_updated_at": "2022-11-30T23:59:59Z"
  },
  "data": {
    "USD": {   // <- Remove this key/value pair since it's the base currency.
      "code": "USD",
      "value": 1.341371
    },
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

/* const data = {
  "meta": {
    "last_updated_at": "2022-11-30T23:59:59Z"
  },
  "data": {
    "USD": {   // <- Remove this key/value pair since it's the base currency.
      "code": "USD",
      "value": 1.341371
    },
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

const baseCurrencyData: any = {};

for (const [ key, value ] of Object.entries(data.data)) { 
  if (key !== "USD") { 
    const { code } = value;
    baseCurrencyData[ key ] = {code};
  }
}
console.log(baseCurrencyData); */
