import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Receipt, Inbox, Package, BookOpen, Truck, Settings } from 'lucide-react';

export const Navbar = () => {
  const { activeTab, setActiveTab, inwardOrders, products, khataCustomers, todayStats } = useStore();
  const { isManager, isCashier } = useAuth();

  const pendingOrdersCount = inwardOrders.filter(
    (o) => o.status === 'PENDING_REVIEW' || o.status === 'PACKING'
  ).length;

  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  const totalKhataDue = khataCustomers.reduce((sum, c) => sum + c.due, 0);

  const allTabs = [
    { id: 'pos', label: 'POS Billing Counter', shortcut: 'F2', icon: Receipt, managerOnly: false },
    {
      id: 'orders',
      label: 'Inward Online Orders',
      shortcut: 'F4',
      icon: Inbox,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} NEW` : null,
      badgeColor: 'bg-amber-500 text-slate-950 animate-pulse',
      managerOnly: false
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      shortcut: 'F10',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      managerOnly: false
    },
    {
      id: 'khata',
      label: 'Customer Khata',
      shortcut: 'F8',
      icon: BookOpen,
      badge: `₹${totalKhataDue.toLocaleString('en-IN')}`,
      badgeColor: 'text-amber-400 font-mono',
      managerOnly: false
    },
    // Manager Only Tabs (Hidden completely for Cashier!)
    { id: 'po', label: 'Purchase Orders', shortcut: 'F9', icon: Truck, managerOnly: true },
    { id: 'settings', label: 'Store & Delivery Config', icon: Settings, managerOnly: true }
  ];

  // Cashier ko unauthorized tabs MAAT DIKHAO (Strict hiding!)
  const visibleTabs = allTabs.filter((tab) => !tab.managerOnly || isManager);

  // If activeTab is po or settings, but user is cashier, redirect to pos immediately
  useEffect(() => {
    if (isCashier && (activeTab === 'po' || activeTab === 'settings')) {
      setActiveTab('pos');
    }
  }, [isCashier, activeTab, setActiveTab]);

  return (
    <nav className="bg-[#0F1422] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between overflow-x-auto scrollbar-none py-1.5">
      
      {/* Nav Tabs List - Only Permitted Tabs Rendered */}
      <div className="flex items-center gap-1.5 min-w-max">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-tight transition flex items-center gap-2 relative ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.shortcut && (
                <span className={`text-[10px] font-mono ${isActive ? 'opacity-90' : 'text-slate-500'}`}>
                  ({tab.shortcut})
                </span>
              )}
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Today Sales KPI Bar */}
      <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-slate-400 pl-4 border-l border-slate-800">
        <div>
          TODAY BILLS: <span className="text-white font-bold">{todayStats.billsCount}</span>
        </div>
        <div>
          TODAY SALES:{' '}
          <span className="text-emerald-400 font-bold">
            ₹{todayStats.salesTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

    </nav>
  );
};