import CurrencyCache from "../internal";

test("addTimeStampAndAddCurrencyToCache works", () => {
  const cache = new CurrencyCache({});
  const mockData = {
    data: {
      CAD: {
        code: "CAD",
        value: 1.343457,
      },
      EUR: {
        code: "EUR",
        value: 0.949874,
      },
      GBP: {
        code: "GBP",
        value: 0.815737,
      },
    },
    meta: {
      last_updated_at: "2022-12-01T23:59:59Z",
    },
  };

  const mockTimestamp = 1670110528842000;
  cache.addTimeStampAndAddCurrencyToCache("USD", mockData, mockTimestamp);

  const expectedCache = new Map();
  expectedCache.set("USD", {
    CAD: { code: "CAD", value: 1.343457 },
    EUR: { code: "EUR", value: 0.949874 },
    GBP: { code: "GBP", value: 0.815737 },
    timestamp: 1670110528842000,
  });

  expect(cache.cache).toEqual(expectedCache);
});

it("getTargetCurrencies works", async () => {
  const result = {
    data: {
      CAD: {
        code: "CAD",
        value: 1.343457,
      },
      USD: {
        code: "USD",
        value: 0.949874,
      },
      GBP: {
        code: "GBP",
        value: 0.815737,
      },
    },
    meta: {
      last_updated_at: "2022-12-01T23:59:59Z",
    },
  };

  jest.spyOn(global, "fetch").mockImplementation(
    () =>
      Promise.resolve({
        json: () => Promise.resolve(result),
      }) as Promise<Response>
  );

  const cache = new CurrencyCache({});
  const eurConverionData = await cache.getTargetCurrencies("EUR");

  expect(eurConverionData.CAD!.value).toEqual(result.data.CAD.value);
  expect(eurConverionData.USD!.value).toEqual(result.data.USD.value);
  expect(eurConverionData.GBP!.value).toEqual(result.data.GBP.value);

  // remove the mock to ensure tests are completely isolated
  (global["fetch"] as any).mockRestore();
});

// TODO: write more tests. Test the LRU eviction policy. Test the LFU eviction policy.

/* The test below fails. I created this to check that fetching data works. */
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
