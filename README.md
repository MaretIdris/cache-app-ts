# Cache app

- Two eviction policies:

  - Least Recently Used (LRU)
  - Least Frequently Used (LFU)

- You can set the cache max size, eviction policy and time in seconds when
  data needs refreshing in a config object.


## The idea behind a cache

- I have to get currency data
- before I go to fetch the data from the API endpoint, I want to check if I have
  the data in the cache
- I check CurrencyCache.getCurrency(theCurrencyIWant)
- The getCurrency method returns the data if it exists in the cache.
  - It 