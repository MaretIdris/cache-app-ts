import React, { useEffect, useMemo, useState } from "react";
import "./styles/App.css";
import { doSomething } from "./cache";

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

const App = () => {
  const [cache, setCache] = useState(new Map());

  const keys: JSX.Element[] = [];
  for (const [key, value] of cache.entries()) {
    keys.push(<p key={key}>{key}</p>);
  }

  return (
    <div className="App">
      <button onClick={() => doSomething(cache, setCache, "USD")}>
        Get USD rates
      </button>
      <button onClick={() => doSomething(cache, setCache, "EUR")}>
        Get EUR rates
      </button>
      <button onClick={() => doSomething(cache, setCache, "GBP")}>
        Get GBP rates
      </button>
      <div>
        <h1>Cache</h1>
        <p>{keys}</p>
      </div>
    </div>
  );
};

export default App;
