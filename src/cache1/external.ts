import CurrencyCache from "./internal";

export interface CurrencyCacheInterface {
  /**
   * @param baseCurrency The currency to convert from
   * @returns An object with the target currencies and their values
   */
  getTargetCurrencies: (baseCurrency: CurrencyName) => TargetCurrencies;
  /** Return target currency value as number. */
  // convert: (baseCurrency: string, targetCurrency: string) => number;
}

export interface CurrencyCacheArgs {
  /** The order of removing the results from the cache when cache is full.
   * @default "Least Recently Used"
   */
  evictionPolicy?: "Least Recently Used" | "Least Frequently Used";
  /** Indicates the maximum number of items we can store in the cache. After this number we will
   * start purging results from the cache.
   * @default 2
   * */
  maxSize?: number;
  /** Time window in seconds after data is old and needs to be fetched again.
   * @default 60
   */
  dataTimeWindowInSeconds?: number;
}

export type CurrencyName = "USD" | "EUR" | "CAD" | "GBP";
export type TargetCurrencies = Timestamp &
  Partial<Record<CurrencyName, CurrencyInfo>>;
export interface CurrencyInfo {
  code: CurrencyName;
  value: number;
}
// Intersection type.
export type Timestamp = { timestamp: number };

export const currencyCache = (
  args: CurrencyCacheArgs
): CurrencyCacheInterface => {
  return new CurrencyCache(args);
};
