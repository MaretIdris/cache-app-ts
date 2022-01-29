import { fetchCurrencyData } from "./fetchCurrencyData";

export function run() {
  fetchCurrencyData("USD").then(console.log).catch(console.error);
}
