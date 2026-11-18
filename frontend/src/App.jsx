import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { PosView } from './components/pos/PosView';
import { OrdersView } from './components/orders/OrdersView';
import { InventoryView } from './components/inventory/InventoryView';
import { KhataView } from './components/khata/KhataView';
import { PurchaseOrdersView } from './components/po/PurchaseOrdersView';
import { SettingsView } from './components/settings/SettingsView';
import { ThermalReceiptModal } from './components/pos/ThermalReceiptModal';
import { ParchiModal } from './components/orders/ParchiModal';
import { LoginModal } from './components/auth/LoginModal';
import { AuthPage } from './components/auth/AuthPage';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { ToastContainer } from './components/common/ToastContainer';

const MainLayout = () => {
  const { activeTab, theme } = useStore();
  const { isAuthenticated, isCustomer } = useAuth();

  // 1. Agar user authenticated nahi hai, toh strictly Login / Signup Page dikhao (No access without auth!)
  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  // 2. Agar user 'Customer / Consumer' role ka hai toh use Customer Home Ordering & Tracker Dashboard dikhao!
  if (isCustomer) {
    return (
      <>
        <CustomerPortal />
        <LoginModal />
        <ToastContainer />
      </>
    );
  }

  // 3. Agar user 'Store Manager' ya 'Cashier' role ka hai toh Store Terminal Suite dikhao!
  return (
    <div className={`min-h-screen flex flex-col antialiased ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0E14] text-slate-100'} selection:bg-emerald-500 selection:text-black`}>
      <Header />
      <Navbar />

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'pos' && <PosView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'khata' && <KhataView />}
        {activeTab === 'po' && <PurchaseOrdersView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals & Auth Overlays */}
      <ThermalReceiptModal />
      <ParchiModal />
      <LoginModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainLayout />
      </StoreProvider>
    </AuthProvider>
  );
}
