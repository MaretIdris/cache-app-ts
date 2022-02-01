import React from "react";

type RenderKeysProps = {
  cache: Map<any, any>;
};

export function RenderKeys({ cache }: RenderKeysProps) {
  const keys: JSX.Element[] = [];
  for (const [key, value] of cache.entries()) {
    keys.push(<p key={key}>{key}</p>);
  }
  return <>{keys.reverse()}</>;
}