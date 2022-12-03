import CurrencyCache from "../internal";

test("getCurrency works", () => {
  const cache = new CurrencyCache({});
  const result = cache.getCurrency("USD");
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
