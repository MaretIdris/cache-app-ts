import React, { useState } from "react";
import "../styles/App.css";
import { CacheConfig, CurrencyCache } from "../cache";
import { FancyBorder } from "./FancyBorder";
import { RenderKeys } from "./RenderKeys";

export const App = () => {
  const cacheConfig: CacheConfig = {
    maxCacheSize: 3,
    dataNeedsRefreshingInSec: 86400,
    // evictionPolicy: "Least Recently Used",
    evictionPolicy: "Least Frequently Used",
  };

  const [cache, setCache] = useState<CurrencyCache>(
    new CurrencyCache(cacheConfig)
  );

  return (
    <div className="App">
      <button onClick={() => cache.fetchExchangeRate("USD", setCache)}>
        Get USD rates
      </button>
      <button onClick={() => cache.fetchExchangeRate("EUR", setCache)}>
        Get EUR rates
      </button>
      <button onClick={() => cache.fetchExchangeRate("GBP", setCache)}>
        Get GBP rates
      </button>
      <button onClick={() => cache.fetchExchangeRate("CAD", setCache)}>
        Get CAD rates
      </button>
      <FancyBorder color="yellow" padding="20" boxShadow="1px 3px 1px #9E9E9E" margin="20">
        <h1>Cache</h1>
        <RenderKeys
          cacheMap={cache.cacheMap}
          evictionPolicy={cache.evictionPolicy}
          renderOrder="Ascending"
          // renderOrder="Descending"
        />
        {/*Don't delete the line below. It shows another way to render keys.*/}
        {/*{renderKeys(cache)}*/}
      </FancyBorder>
    </div>
  );
};

// function renderKeys(cache: Map<any, any>): JSX.Element {
//   const keys: JSX.Element[] = [];
//   for (const [key, value] of cache.entries()) {
//     keys.push(<p key={key}>{key}</p>);
//   }
//   return <div>{keys.reverse()}</div>;
// }
