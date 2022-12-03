import CurrencyCache from "../internal";

test("getCurrency works", () => {
  const cache = new CurrencyCache({});
  const mockData = {
    "meta": {
      "last_updated_at": "2022-11-30T23:59:59Z"
    },
    "data": {
      "USD": {   // <- Remove this key/value pair since it's the base currency.
        "code": "USD",
        "value": 1.341371
      },
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
  const timestamp = cache.generateTimestampInSec()
  const result = cache.addTimeStampAndAddCurrencyToCache("USD", mockData, timestamp);
  expect(result).toEqual({})

});

// test("fetchingData works", async () => {
//   const cache = new CurrencyCache({
//     evictionPolicy: "Least Recently Used",
//     maxSize: 2,
//     dataTimeWindowInSeconds: 60,
//   });

//   const data = await cache.fetchData("USD");
//   const result = {
//  "data": Object {
//      "CAD": Object {
//        "code": "CAD",
//        "value": 1.343457,
//      },
//      "EUR": Object {
//        "code": "EUR",
//        "value": 0.949874,
//      },
//      "GBP": Object {
//        "code": "GBP",
//        "value": 0.815737,
//      },
//    },
//    "meta": Object {
//      "last_updated_at": "2022-12-01T23:59:59Z",
//    },
//  }

//   expect(data).toEqual({});
// });
