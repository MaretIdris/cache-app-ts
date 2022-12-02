import _ from "lodash";

export interface CurrencyCacheInterface {
  /** The order of removing the results from the cache when cache is full. */
  evictionPolicy: "Least Recently Used" | "Least Frequently Used";
  /** Indicates the maximum number of items we can store in the cache. After this number we will start purging results from the cache. */
  maxSize: number;
  /** Time window in seconds after data is old and needs to be fetched again.  */
  dataTimeWindowInSeconds: number;
  /** Returns all the targetCurrencies conversions */
  getCurrency?: (baseCurrency: CurrencyName) => BaseCurrencyConversions;
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
type BaseCurrencyConversions = Timestamp &
  Partial<Record<CurrencyName, CurrencyInfo>>;

/* We want our data to look like:
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
  baseCurrency3: {
    timestamp: number
    targetCurrency2: {
     "code": string
     "value": number
    }
    targetCurrency3: {
     "code": string
     "value": number
    }
  }

*/

class CurrencyCache {
  evictionPolicy: "Least Recently Used" | "Least Frequently Used" =
    "Least Recently Used";
  maxSize: number = 2;
  dataTimeWindowInSeconds = 60;
  private _allCurrencies = ["USD", "EUR", "CAD", "GBP"];
  private _cache: Map<CurrencyName, CurrencyInfo> = new Map();
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

  getCurrency = (baseCurrency: CurrencyName): BaseCurrencyConversions => {
    /* 
    - If the cache is empty, fetch the asked data, add it to cache, if evictionPolicy is LRU update _currencyPopularity and return the result.

    - Check if the data is fresh in the cache (data is fresh when the time the previous data was fetched minus current time is less then dataTimeWindowInSeconds)
          - If yes, if evictionPolicy is LRU update _currencyPopularity, and return the relevant data
          -  If no, check if cache is full
              - If yes, check the eviction policy. < - Making space for new data.
                - If the evicition policy is LRU, remove the least recently used data(first currency from the map)
                  from the cache.We are making space for the new data which we will be fetching. 
                - If the eviction policy is LFU, check for the least frequently used data and remove the currency from the cache and set the currencies popularity to 0.
    
    - Fetch the data.When get the result, clean up the result, add a timestamp and add the result to the cache. if evictionPolicy is LRU update _currencyPopularity. Return the cleaned up result.  
    */
    if (this._cacheIsEmpty()) {
      const targetCurrencies = this.fetchData(baseCurrency);
      const timestampInSec = this._generateTimestampInSec();
      // Make a currency object and store it in the cache.
      this._addCurrencyToCache(baseCurrency, targetCurrencies, timestampInSec);
      if (this.evictionPolicy === "Least Recently Used") {
        this._incrementCurrencyPopularity(baseCurrency);
      }
    }

    return {
      timestamp: 0,
      USD: {
        value: 1.2,
        code: "USD",
      },
      EUR: {
        value: 1.2,
        code: "EUR",
      },
      GBP: {
        value: 1.2,
        code: "GBP",
      },
    };
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
  private _resetCurrencyPopularity = (baseCurrency: CurrencyName) => {
    this._currencyPopularity.set(baseCurrency, 0);
  };

  private _addCurrencyToCache = (
    baseCurrency: CurrencyName,
    data: any,
    timestamp: number
  ) => {
    const { data: currencyData } = data;
    const currencyDataCopy = _.cloneDeep(currencyData);
    this._cache.set(baseCurrency, { ...currencyDataCopy, timestamp });
  };

  private _generateTimestampInSec = () => {
    return Date.now() * 1000;
  };

  private _cacheIsEmpty = (): boolean => {
    return this._cache.size === 0;
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

*/
