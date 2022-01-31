import React, { useMemo } from "react";
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
  const tempCache = useMemo(() => new Map(), []);

  return (
    <div className="App">
      <button onClick={() => doSomething(tempCache, "USD")}>
        Get USD rates
      </button>
      <button>Get EUR rates</button>
      <button>Get GBP rates</button>
      <div>
        <h3>Cache</h3>
      </div>
    </div>
  );
};

export default App;
