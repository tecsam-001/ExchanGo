"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface HoverContextType {
  hoveredExchangeId: string | number | null;
  setHoveredExchangeId: (id: string | number | null) => void;
}

const HoverContext = createContext<HoverContextType | undefined>(undefined);

export const HoverProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [hoveredExchangeId, setHoveredExchangeId] = useState<
    string | number | null
  >(null);

  return (
    <HoverContext.Provider value={{ hoveredExchangeId, setHoveredExchangeId }}>
      {children}
    </HoverContext.Provider>
  );
};

export const useHover = (): HoverContextType => {
  const context = useContext(HoverContext);
  if (context === undefined) {
    throw new Error("useHover must be used within a HoverProvider");
  }
  return context;
};
