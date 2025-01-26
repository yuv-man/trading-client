import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex-1 ml-12">
      <div className="container px-4 py-8">
        <div className="app-primary-title">
          <img src="./public/ManeyMaker.png" alt="MoneyMaker" className="w-12 h-12 mb-2" />
          <h1 className="text-3xl font-bold mb-2 font-serif">MarketMind</h1>
        </div>
        {children}
      </div>
    </div>
  );
}