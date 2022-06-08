import React from "react";

type Props = {
  children: any;
  color: string;
  padding: string;
  boxShadow: string;
  margin: string
};

// Containment: https://reactjs.org/docs/composition-vs-inheritance.html
export function FancyBorder({ children, color, padding, boxShadow, margin }: Props) {
  return (
    <div style={{ border: `2px solid ${color}`, padding: `${padding}px`, boxShadow: `${boxShadow}`, margin: `${margin}px` }}>
      {children}
    </div>
  );
}
