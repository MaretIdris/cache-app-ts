import React, { useState } from "react";
import "../styles/App.css";
import { CacheConfig, CurrencyCache } from "../cache";
import { FancyBorder } from "./FancyBorder";
import { RenderKeys } from "./RenderKeys";

export type Currency = "USD" | "EUR" | "GBP";

export interface BaseUSD {
  timestamp: number;
  USD: Partial<Record<Currency, number>>;
  // USD: Partial<{ [P in Currency]: number }>;
}

export interface BaseEUR {
  timestamp: number;
  EUR: Partial<Record<Currency, number>>;
}

export interface BaseGBP {
  timestamp: number;
  GBP: Partial<Record<Currency, number>>;
}

export type CurrencyValue = BaseUSD | BaseEUR | BaseGBP;

export type CacheMap = Map<string, CurrencyValue>;

export const App = () => {
  const cacheConfig: CacheConfig = {
    size: 2,
    dataNeedsRefreshingInSec: 86400,
    evictionPolicy: "Least Recently Used",
  };

  const [cache, setCache] = useState<CurrencyCache>(
    new CurrencyCache(cacheConfig)
  );
  console.log("App => ", cache);
  console.log(typeof cache.fetchExchangeRate);

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
      <FancyBorder color="yellow" padding="20">
        <h1>Cache</h1>
        <RenderKeys cacheMap={cache.cacheMap} />
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
