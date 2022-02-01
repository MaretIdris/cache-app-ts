import React from "react";

type Props = {
  children: any;
  color: string;
  padding: string;
};

export function FancyBorder({ children, color, padding }: Props) {
  return (
    <div style={{ border: `2px solid ${color}`, padding: `${padding}px` }}>
      {children}
    </div>
  );
}