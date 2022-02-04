import React from "react";
import { CacheMap, EvictionPolicy } from "../cache";

// There are 4 ways to render
// - Last access time (LRU):
//      - ascending order
//      - descending order
// - Popularity (LFU):
//      - ascending order
//      - descending order

type RenderKeysOrder = "Ascending" | "Descending";

type RenderKeysProps = {
  cacheMap: CacheMap;
  evictionPolicy: EvictionPolicy;
  renderOrder: RenderKeysOrder;
};

type Property = "lastAccessTime" | "popularity";

export function RenderKeys({
  cacheMap,
  evictionPolicy,
  renderOrder,
}: RenderKeysProps) {
  let keys: JSX.Element = <></>;

  if (evictionPolicy === "Least Recently Used") {
    switch (renderOrder) {
      case "Ascending":
        keys = sortByAscending("lastAccessTime");
        break;
      case "Descending":
        keys = sortByDescending("lastAccessTime");
        break;
    }
  } else if (evictionPolicy === "Least Frequently Used") {
    switch (renderOrder) {
      case "Ascending":
        keys = sortByAscending("popularity");
        break;
      case "Descending":
        keys = sortByDescending("popularity");
        break;
    }
  }

  // if (renderOrder === "Ascending") {
  //   switch (evictionPolicy) {
  //     case "Least Recently Used":
  //       keys = sortByAscending("lastAccessTime");
  //       break;
  //     case "Least Frequently Used":
  //       keys = sortByAscending("popularity");
  //       break;
  //   }
  // } else {
  //   switch (evictionPolicy) {
  //     case "Least Recently Used":
  //       keys = sortByDescending("lastAccessTime");
  //       break;
  //     case "Least Frequently Used":
  //       keys = sortByDescending("popularity");
  //       break;
  //   }
  // }

  return <>{keys}</>;

  function sortByAscending(property: Property): JSX.Element {
    const keys: JSX.Element[] = [];
    // Sort array by smallest to largest lastAccessTime.
    const cacheArray = Array.from(cacheMap);
    cacheArray.sort((a, b) => a[1][property] - b[1][property]);
    for (const [key, value] of cacheArray) {
      keys.push(<p key={key}>{key}</p>);
    }
    return <>{keys}</>;
  }

  function sortByDescending(property: Property): JSX.Element {
    const keys: JSX.Element[] = [];
    // Sort array by largest to smallest lastAccessTime.
    const cacheArray = Array.from(cacheMap);
    cacheArray.sort((a, b) => b[1][property] - a[1][property]);
    for (const [key, value] of cacheArray) {
      keys.push(<p key={key}>{key}</p>);
    }
    return <>{keys}</>;
  }
}
