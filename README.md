# Client-side cache

Cache is a data structure and different functions to check/modify it. It is used to store the data in the browser memory and access it quickly.

Implement a class CurrencyCache that has the following properties and methods:
 - evictionPolicy: Least Recently Used (LRU) or Least Frequently Used (LFU)
 - maxSize: maximum number of items in the cache
 - timeWindowInSeconds: time window in seconds to check the does the data needs refreshing
 - getCurrency: returns the currency of the cache


## The idea behind a cache

- E.g user clicks a button, 

- I have to get currency data
- before I go to fetch the data from the API endpoint, I want to check if I have
  the data in the cache
- I check CurrencyCache.getCurrency(theCurrencyIWant). Returns the currency data.
  1. If cache has the data && the data is not expired, I return the data.
  2. If cache has the data, but the data is expired, fetch the new data (update the timestamp,
     update anything else related to the particular eviction policy, update the cache)

- The getCurrency method returns the data if it exists in the cache.

  - If the data doesn't exist in the cache, I call this.fetchExchangeRate(theCurrencyIWant,
    setCache).
    - Note: setCache is is React hook to set the state. I created it in the App component
      (top level) and imported it in the cache.ts file.

- I am noticing that my naming could be improved.

  - getCurrency(theCurrencyIWant, setCache): currencyIWantMap

  1. if currency doesn't exist in the cache, I call fetchExchangeRate(theCurrencyIWant, setCache)

  - fetchExchangeRate() updates the cache. This method will update the cache. It doesn't return anything.
  - I return the currency I want from the cache (type currencyIWantMap)

  2. if currency does exist in the cache: Now we need to make sure that the data is not expired/fresh.

  1. I check if the data is expired

     - I call fetchExchangeRate(theCurrencyIWant, setCache). This method will update the cache. It doesn't return anything.
     - I return the currency I want from the cache (type currencyIWantMap)

  1. If the data is not expired

     - I return the currency I want from the cache (type currencyIWantMap)

// -----------------------------------------------

fetchExhangeRate(theCurrencyIWant, setCache). Fetches the fresh data, updates timestamp and the cache.

1. I call the API endpoint (fetch API, axios etc)

- When I fetch the exchange rate, I get back some data.
- Change the data to the shape we desire.
- Now I need to check if the cacheMap is full

  1. If the cacheMap is full, I need to evict the data. I now need to check the eviction
     policy and we need to update policy related data for the new curreny.
     This is the point where we can add more eviction policies in the future.

     1. If the eviction policy is LRU (standard queue), I need to evict the data that has been used
        the least recently. Each baseCurrency will need to have a timestamp (in seconds) of when it was last used. Then we will check

        - I need to remove the first item from the queue.
        - I need to add the new data to the end of the queue.

     2. If the eviction policy is LFU (least frequently used), I need to evict the data that
        has the smallest frequency property number. Ok, now I know that I need to add a new
        property to each of our cacheMap currencies.
        - I need to increment/add the frequency property for the new data.
        - Out of all the
        - I need to add the new data (with the new property) to the end of the queue.

  2.If the cacheMap is not full,

  - I need to add/update the data in the cacheMap. I need to also
    update it's timestamp or frequency property (depending on the eviction policy).

- Could there be a method evictCurrency
