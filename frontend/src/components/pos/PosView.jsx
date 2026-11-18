import React from 'react';
import { ProductGrid } from './ProductGrid';
import { CartTray } from './CartTray';

export const PosView = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 columns: Products catalog & scanner */}
      <div className="lg:col-span-7">
        <ProductGrid />
      </div>

      {/* Right 5 columns: Active invoice cart */}
      <div className="lg:col-span-5">
        <CartTray />
      </div>
    </div>
  );
};