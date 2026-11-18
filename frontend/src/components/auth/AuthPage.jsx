import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  ShieldCheck,
  UserCheck,
  ShoppingBag,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Receipt,
  Truck,
  AlertCircle,
  KeyRound,
  Building2
} from 'lucide-react';

export const AuthPage = () => {
  const { login, register, quickSwitch } = useAuth();

  // Primary Portal Audience: 'customer' (Grocery Shopper) | 'business' (Store Staff & Manager)
  const [portalMode, setPortalMode] = useState('customer');

  // Sub-tab: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Customer Signup form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState('');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);

  // Store Manager Signup form state
  const [storeName, setStoreName] = useState('Apna Bazar Supermarket');
  const [storeCode, setStoreCode] = useState('DEL-8821');
  const [masterSecurityPin, setMasterSecurityPin] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerConfirmPassword, setManagerConfirmPassword] = useState('');
  const [showManagerPassword, setShowManagerPassword] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Switch Portal Handler
  const handleSwitchPortal = (targetPortal) => {
    setPortalMode(targetPortal);
    setActiveTab('login');
    setErrorMsg('');
    setSuccessMsg('');
    setLoginIdentifier('');
    setLoginPassword('');
  };

  // Quick Fill Sole Store Manager
  const handleQuickFill = (roleKey = 'manager') => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoginIdentifier('manager@sibms.com');
    setLoginPassword('admin123');
  };

  // Immediate 1-Click Manager Login
  const handleDirectDemoLogin = () => {
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      quickSwitch('manager');
      setLoading(false);
    }, 250);
  };

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your username or email');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginIdentifier.trim(), loginPassword);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Authentication failed. Check your network or server connection.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Customer Signup (ROLE_CUSTOMER ONLY)
  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!customerPassword || customerPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    if (customerPassword !== customerConfirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: customerName.trim(),
        email: customerEmail.trim(),
        password: customerPassword,
        role: 'CUSTOMER',
        phone: customerPhone.trim(),
        address: customerAddress.trim()
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Sign up failed. Email might already exist.');
      } else {
        setSuccessMsg('Customer account created! Opening GharSe Grocery Portal...');
      }
    } catch (err) {
      setErrorMsg('Registration failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Store Manager Signup (ROLE_MANAGER with Master Security PIN)
  const handleManagerSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Verify Store Security PIN to prevent unauthorized customers from getting manager privileges!
    const validPins = ['8821', '1234', 'APNA2026', 'ADMIN'];
    if (!validPins.includes(masterSecurityPin.trim())) {
      setErrorMsg('Invalid Store Master Security PIN. Only authorized store owners/managers can register. (Default PIN: 8821)');
      return;
    }

    if (!managerName.trim()) {
      setErrorMsg('Please enter manager full name');
      return;
    }
    if (!managerEmail.trim() || !managerEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email');
      return;
    }
    if (!managerPassword || managerPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    if (managerPassword !== managerConfirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: `${managerName.trim()} (Manager - ${storeName.trim()})`,
        email: managerEmail.trim(),
        password: managerPassword,
        role: 'MANAGER'
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Manager registration failed.');
      } else {
        setSuccessMsg('Store & Manager account registered! Opening Admin Suite...');
      }
    } catch (err) {
      setErrorMsg('Registration failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden antialiased selection:bg-emerald-500 selection:text-black">
      
      {/* Background Neon Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Primary Audience Portal Toggle (Customer vs Business Terminal) */}
      <div className="mb-6 flex items-center bg-[#0F1422] p-1.5 rounded-2xl border border-slate-800 shadow-xl z-20">
        <button
          type="button"
          onClick={() => handleSwitchPortal('business')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            portalMode === 'business'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Store Staff & Manager Terminal</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchPortal('customer')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            portalMode === 'customer'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>GharSe Customer Portal</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-[#0F1420]/95 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden z-10">
        
        {/* Left Side: Brand & Feature Showcase */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#121927] to-[#0D121B] p-8 flex-col justify-between border-r border-slate-800/80 relative">
          <div>
            {/* Store Brand Header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-2xl font-black text-xl flex items-center justify-center shadow-lg ${
                  portalMode === 'customer'
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/25'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/25'
                }`}
              >
                {portalMode === 'customer' ? <ShoppingBag className="w-6 h-6 text-slate-950" /> : <Store className="w-6 h-6 text-slate-950" />}
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                  {portalMode === 'customer' ? 'GharSe Grocery' : 'Apna Bazar Terminal'}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      portalMode === 'customer'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {portalMode === 'customer' ? 'Consumer' : 'Store Ops'}
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  {portalMode === 'customer'
                    ? 'Online Home Grocery & Parchi Delivery'
                    : 'Smart Retail Inventory & Cashier POS System'}
                </p>
              </div>
            </div>

            {/* Portal-specific feature bullets */}
            {portalMode === 'customer' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Order fresh groceries directly from your neighborhood supermarket with zero tech hassle.
                </p>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/50">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Handwritten Parchi Upload</h4>
                    <p className="text-[11px] text-slate-400">Snap a quick photo of your handwritten grocery note; our store team digitizes and packs it.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/50">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live 4-Step Order Tracker</h4>
                    <p className="text-[11px] text-slate-400">Review &rarr; Packing &rarr; Out for Delivery &rarr; Delivered. Stay updated in real time.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Enterprise retail billing terminal and management suite for cashiers, inventory managers, and store owners.
                </p>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/50">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Cashier High-Speed POS Billing</h4>
                    <p className="text-[11px] text-slate-400">Barcode scanner, keyboard hotkeys (F2-F10), thermal receipt printer, and Khata credit ledger.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/50">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Store Manager Administration</h4>
                    <p className="text-[11px] text-slate-400">Onboard cashiers, manage stock, issue purchase orders, and toggle store home delivery policy.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Spring Boot + Vite Connected
            </span>
            <span className="text-[11px] text-slate-500">DEL-8821</span>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Sub-tab Switcher (Sign In vs Sign Up) */}
          <div className="flex items-center bg-[#090C14] p-1 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? portalMode === 'customer'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {portalMode === 'customer' ? 'Customer Sign In' : 'Staff / Manager Sign In'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'signup'
                  ? portalMode === 'customer'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {portalMode === 'customer' ? 'New Customer Sign Up' : 'Register Retail Store (Manager)'}
              </span>
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: SIGN IN (LOGIN) */}
          {/* ============================================================== */}
          {activeTab === 'login' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-black text-white tracking-tight">
                  {portalMode === 'customer' ? 'Welcome to GharSe Grocery' : 'Business Terminal Sign In'}
                </h3>
                <p className="text-xs text-slate-400">
                  {portalMode === 'customer'
                    ? 'Sign in to order groceries, upload handwritten Parchi, and track your orders.'
                    : 'Cashiers and Store Managers: enter your credentials to open your terminal.'}
                </p>
              </div>

              {/* Business Note */}
              {portalMode === 'business' && (
                <div className="mb-5 p-3 rounded-2xl bg-[#090C14] border border-slate-800 text-slate-400 text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Authorized store staff terminal. Enter your store credentials to continue.</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    {portalMode === 'customer' ? 'Mobile Number or Email' : 'Work Email or Terminal Username'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={portalMode === 'customer' ? 'e.g. customer or phone' : 'e.g. manager, cashier, or work email'}
                      className="w-full bg-[#090C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      (Demo: admin123 / cashier123 / customer123)
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#090C14] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-slate-500 hover:text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-black text-sm tracking-wide shadow-lg transition btn-press flex items-center justify-center gap-2 mt-2 disabled:opacity-50 ${
                    portalMode === 'customer'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{portalMode === 'customer' ? 'Sign In & Start Shopping' : 'Sign In & Open Terminal'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: SIGN UP */}
          {/* ============================================================== */}
          {activeTab === 'signup' && (
            <div>
              {portalMode === 'customer' ? (
                /* -------------------------------------------------------- */
                /* CUSTOMER SIGN UP (STRICTLY ROLE_CUSTOMER, NO ROLE PICKER) */
                /* -------------------------------------------------------- */
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-white tracking-tight">Create Customer Account</h3>
                    <p className="text-xs text-slate-400">
                      Sign up for home grocery delivery, handwritten Parchi order upload, and live tracking.
                    </p>
                  </div>

                  <form onSubmit={handleCustomerSignup} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Your Full Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Ramesh Patel"
                          className="w-full bg-[#090C14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Mobile Number (For Delivery SMS) *</label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full bg-[#090C14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="ramesh@example.com"
                            className="w-full bg-[#090C14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Home Delivery Address *</label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="House/Flat No., Sector, City"
                          className="w-full bg-[#090C14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Password (min 8 chars) *</label>
                        <input
                          type={showCustomerPassword ? 'text' : 'password'}
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#090C14] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Confirm Password *</label>
                        <input
                          type={showCustomerPassword ? 'text' : 'password'}
                          value={customerConfirmPassword}
                          onChange={(e) => setCustomerConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#090C14] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400 transition btn-press flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Account & Open Grocery Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* -------------------------------------------------------- */
                /* STORE MANAGER REGISTRATION (WITH STORE MASTER PIN)       */
                /* -------------------------------------------------------- */
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-white tracking-tight">Register as Store Manager</h3>
                    <p className="text-xs text-slate-400">
                      Onboard your supermarket store to access Admin POS billing, inventory, and staff management.
                    </p>
                  </div>

                  <form onSubmit={handleManagerSignup} className="space-y-3 text-xs">
                    
                    {/* Store Info Row */}
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-emerald-300 mb-1">Store / Supermarket Name *</label>
                          <input
                            type="text"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            placeholder="e.g. Apna Bazar Supermarket"
                            className="w-full bg-[#090C14] border border-slate-800 rounded-xl px-3 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-emerald-300 mb-1">Branch Code / Area</label>
                          <input
                            type="text"
                            value={storeCode}
                            onChange={(e) => setStoreCode(e.target.value)}
                            placeholder="e.g. DEL-8821 Sector 12"
                            className="w-full bg-[#090C14] border border-slate-800 rounded-xl px-3 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Store Master Security PIN */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-semibold text-emerald-300">
                            Store Master Security PIN *
                          </label>
                          <span className="text-[10px] text-emerald-400/80 font-mono">
                            Security key (Default PIN: 8821)
                          </span>
                        </div>
                        <div className="relative">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            value={masterSecurityPin}
                            onChange={(e) => setMasterSecurityPin(e.target.value)}
                            placeholder="Enter Store Security PIN (8821)"
                            className="w-full bg-[#090C14] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Manager Personal Details */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Manager Full Name *</label>
                      <input
                        type="text"
                        value={managerName}
                        onChange={(e) => setManagerName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full bg-[#090C14] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Work Email Address *</label>
                      <input
                        type="email"
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        placeholder="manager@apnabazar.in"
                        className="w-full bg-[#090C14] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Password (min 8 chars) *</label>
                        <input
                          type={showManagerPassword ? 'text' : 'password'}
                          value={managerPassword}
                          onChange={(e) => setManagerPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#090C14] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Confirm Password *</label>
                        <input
                          type={showManagerPassword ? 'text' : 'password'}
                          value={managerConfirmPassword}
                          onChange={(e) => setManagerConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#090C14] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Note: Cashiers are onboarded by the Store Manager from the dashboard. Cashiers do not self-register.
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition btn-press flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Register Store & Open Admin Suite</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
