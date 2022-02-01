import React, { useState } from "react";
import "./styles/App.css";
import { fetchExchangeRate } from "./cache";
import { FancyBorder } from "./FancyBorder";
import { RenderKeys } from "./RenderKeysProps";

export type Currency = "USD" | "EUR" | "GBP";

// export interface BaseUSD {
//   timestamp?: number;
//   USD: Partial<{ [P in Currency]: number }>;
// }
//
// export interface BaseEUR {
//   timestamp?: number;
//   EUR: Partial<Record<Currency, number>>;
// }
//
// export interface BaseGBP {
//   timestamp?: number;
//   GBP: Partial<Record<Currency, number>>;
// }
//
// type CurrencyValue = BaseUSD | BaseEUR | BaseGBP;
//
// type Cache = Map<string, CurrencyValue>;

export const App = () => {
  const [cache, setCache] = useState(new Map());

  return (
    <div className="App">
      <button onClick={() => fetchExchangeRate(cache, setCache, "USD", 86400)}>
        Get USD rates
      </button>
      <button onClick={() => fetchExchangeRate(cache, setCache, "EUR", 86400)}>
        Get EUR rates
      </button>
      <button onClick={() => fetchExchangeRate(cache, setCache, "GBP", 86400)}>
        Get GBP rates
      </button>
      <FancyBorder color="yellow" padding="20">
        <h1>Cache</h1>
        <RenderKeys cache={cache} />
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
