import React from "react";
import { CacheMap } from "./App";

type RenderKeysProps = {
  cacheMap: CacheMap;
};

export function RenderKeys({ cacheMap }: RenderKeysProps) {
  const keys: JSX.Element[] = [];
  for (const [key, value] of cacheMap.entries()) {
    keys.push(<p key={key}>{key}</p>);
  }
  return <>{keys.reverse()}</>;
}
