import React from "react";

type Props = {
  children: any;
  color: string;
  padding: string;
};

// Containment: https://reactjs.org/docs/composition-vs-inheritance.html
export function FancyBorder({ children, color, padding }: Props) {
  return (
    <div style={{ border: `2px solid ${color}`, padding: `${padding}px` }}>
      {children}
    </div>
  );
}
