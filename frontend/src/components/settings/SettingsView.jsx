import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { getCurrentGpsLocation } from '../../services/locationService';
import {
  Settings,
  Bike,
  Check,
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Trash2,
  Power,
  KeyRound,
  X,
  AlertCircle,
  Palette,
  Moon,
  Sun,
  Sparkles,
  MapPin,
  Navigation
} from 'lucide-react';

// Major retail market hubs in Delhi-NCR
const LOCATION_PRESETS = [
  { label: 'Dwarka Sector 12', lat: 28.5921, lon: 77.0460, address: 'Plot 42, Sector 12 Main Market, Dwarka, New Delhi' },
  { label: 'Janakpuri East', lat: 28.6295, lon: 77.0865, address: 'District Centre, Janakpuri, New Delhi' },
  { label: 'Connaught Place', lat: 28.6315, lon: 77.2167, address: 'Inner Circle, Connaught Place, New Delhi' },
  { label: 'Noida Sector 18', lat: 28.5708, lon: 77.3260, address: 'Atta Market, Sector 18, Noida' }
];

const ACCENT_OPTIONS = [
  { id: 'emerald', name: 'Emerald Green', desc: 'Fresh supermarket aesthetic (Default Apna Bazar)', hex: '#10B981' },
  { id: 'blue', name: 'Sapphire Blue', desc: 'Modern enterprise retail & professional POS', hex: '#2563EB' },
  { id: 'purple', name: 'Royal Violet', desc: 'Premium luxury departmental & gourmet mart', hex: '#8B5CF6' },
  { id: 'cyan', name: 'Electric Cyan', desc: 'High-tech smart inventory & futuristic POS', hex: '#06B6D4' },
  { id: 'amber', name: 'Warm Amber', desc: 'Traditional Indian kirana, spices & wholesale', hex: '#F59E0B' },
  { id: 'rose', name: 'Crimson Ruby', desc: 'High-energy discount mart & festive retail', hex: '#F43F5E' },
];

export const SettingsView = () => {
  const {
    isDeliveryActive,
    toggleDeliveryActive,
    theme,
    setTheme,
    accentColor,
    changeAccentColor,
    settings,
    updateSettings,
    staffMembers,
    addCashier,
    resetCashierPassword,
    toggleStaffStatus,
    removeStaff,
    showToast
  } = useStore();

  // Tabs: 'delivery' | 'staff' | 'appearance'
  const [activeTab, setActiveTab] = useState('delivery');

  // Delivery & Location Settings Form
  const [formData, setFormData] = useState({
    minOrderValue: settings.delivery?.minOrderValue ?? 499,
    deliveryFee: settings.delivery?.deliveryFee ?? 30,
    maxRadiusKm: settings.delivery?.maxRadiusKm ?? 10.0,
    avgSlaMins: settings.delivery?.avgSlaMins ?? 35,
    storeName: settings.storeName || 'Apna Bazar Supermarket',
    gstin: settings.gstin || '07AAAAA0000A1Z5',
    phone: settings.phone || '+91 95285 90856',
    address: settings.address || 'Plot 42, Sector 12 Main Market, Dwarka, New Delhi',
    latitude: settings.latitude ?? 28.5921,
    longitude: settings.longitude ?? 77.0460
  });

  // GPS Auto-detect loading state
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // New Cashier Modal state
  const [isAddCashierOpen, setIsAddCashierOpen] = useState(false);
  const [cashierForm, setCashierForm] = useState({
    name: '',
    username: '',
    email: '',
    password: 'cashier123',
    counter: 'Counter 1 (Fast POS)'
  });
  const [modalError, setModalError] = useState('');

  // Reset Password Modal state
  const [resetTarget, setResetTarget] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetError, setResetError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Browser GPS se store manager ki current location detect karna
  const handleDetectLocation = async () => {
    try {
      setIsDetectingGps(true);
      const coords = await getCurrentGpsLocation();
      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude
      }));
      showToast(`📍 Store GPS Location detect ho gayi: ${coords.latitude}, ${coords.longitude}`, 'success');
    } catch (err) {
      showToast(err.message || 'GPS location detect nahi ho saki.', 'warning');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleSaveDelivery = async (e) => {
    e.preventDefault();
    await updateSettings({
      ...settings,
      storeName: formData.storeName,
      gstin: formData.gstin,
      phone: formData.phone,
      address: formData.address,
      latitude: parseFloat(formData.latitude) || 28.5921,
      longitude: parseFloat(formData.longitude) || 77.0460,
      minOrderValue: parseFloat(formData.minOrderValue) || 499,
      deliveryFee: parseFloat(formData.deliveryFee) || 30,
      deliveryRadiusKm: parseFloat(formData.maxRadiusKm) || 10.0,
      deliverySlaMins: parseInt(formData.avgSlaMins) || 35,
      delivery: {
        ...settings.delivery,
        minOrderValue: parseFloat(formData.minOrderValue) || 499,
        deliveryFee: parseFloat(formData.deliveryFee) || 30,
        maxRadiusKm: parseFloat(formData.maxRadiusKm) || 10.0,
        avgSlaMins: parseInt(formData.avgSlaMins) || 35
      }
    });
  };

  const handleCreateCashier = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!cashierForm.name.trim()) {
      setModalError('Please enter cashier full name');
      return;
    }
    if (!cashierForm.username.trim()) {
      setModalError('Please enter a username or identifier');
      return;
    }
    if (!cashierForm.password || cashierForm.password.length < 8) {
      setModalError('Password must be at least 8 characters long');
      return;
    }

    const email = cashierForm.email.trim() || `${cashierForm.username.trim().toLowerCase()}@sibms.com`;

    const res = await addCashier({
      name: cashierForm.name,
      username: cashierForm.username,
      email: email,
      password: cashierForm.password,
      counter: cashierForm.counter
    });

    if (res && !res.success) {
      setModalError(res.error || 'Failed to create cashier');
      return;
    }

    setIsAddCashierOpen(false);
    setCashierForm({
      name: '',
      username: '',
      email: '',
      password: 'cashier123',
      counter: 'Counter 1 (Fast POS)'
    });
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!newPasswordInput || newPasswordInput.trim().length < 6) {
      setResetError('New password must be at least 6 characters long');
      return;
    }

    const res = await resetCashierPassword(resetTarget.id, newPasswordInput.trim());
    if (res && !res.success) {
      setResetError(res.error || 'Failed to reset password');
      return;
    }

    setResetTarget(null);
    setNewPasswordInput('');
  };

  return (
    <div className="max-w-5xl space-y-5">
      
      {/* Top Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'delivery'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Store Delivery & Operations</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff & Cashier Management</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
            {staffMembers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'appearance'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Appearance</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: STORE DELIVERY & OPERATIONS */}
      {/* ============================================================== */}
      {activeTab === 'delivery' && (
        <div className="bg-[#131722] p-5 rounded-2xl border border-slate-800 space-y-5">
          <div>
            <h3 className="font-extrabold text-base text-white">Store Delivery Operations Policy</h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure whether this store provides Home Delivery service or restricts customer orders to In-Store Counter Pickup only.
            </p>
          </div>

          {/* Master Delivery Availability Switch Card */}
          <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-400" />
                <span>Provide Home Delivery Service</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isDeliveryActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isDeliveryActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                When switched OFF, GharSe customer ordering app immediately disables Home Delivery and automatically directs customers to Counter Pickup for this store.
              </p>
            </div>

            <button
              onClick={toggleDeliveryActive}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDeliveryActive ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDeliveryActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Detailed Form */}
          <form onSubmit={handleSaveDelivery} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Minimum Order Value for Free Delivery (₹)
                </label>
                <input
                  type="number"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Delivery Fee for Below Minimum (₹)
                </label>
                <input
                  type="number"
                  name="deliveryFee"
                  value={formData.deliveryFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Maximum Delivery Radius (KM)
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="maxRadiusKm"
                  value={formData.maxRadiusKm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Average Fulfillment SLA (Minutes)
                </label>
                <input
                  type="number"
                  name="avgSlaMins"
                  value={formData.avgSlaMins}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Store Physical Location & GPS Settings */}
            <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Store Location & 10 KM Kirana Discovery</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Save your grocery store's GPS coordinates so customers within 10 km can discover your shop and send orders.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingGps}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto btn-press"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGps ? 'Detecting GPS...' : '📍 Auto-Detect Store GPS'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">Store Address / Area</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Plot 42, Sector 12 Main Market"
                    className="w-full px-3 py-2 rounded-xl bg-[#131722] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-[#131722] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-[#131722] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Area Location Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="text-slate-400 font-medium">Popular Retail Hubs:</span>
                {LOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: preset.lat,
                        longitude: preset.lon,
                        address: preset.address
                      }));
                      showToast(`Selected location: ${preset.label}`, 'info');
                    }}
                    className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition text-[10px]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Store Registered Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Store GSTIN Number</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 btn-press flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save & Sync Store Policy</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: STAFF & CASHIERS MANAGEMENT (MANAGER RESPONSIBILITY) */}
      {/* ============================================================== */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          
          {/* Header Card */}
          <div className="bg-[#131722] p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Store Cashiers & Terminal Staff</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Manager Responsibility
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                As Store Manager, only you have authority to onboard new cashiers. Create employee credentials here so they can sign in at billing counters.
              </p>
            </div>

            <button
              onClick={() => setIsAddCashierOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition btn-press flex items-center gap-2 self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Cashier</span>
            </button>
          </div>

          {/* Cashiers List Table */}
          <div className="bg-[#131722] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 bg-[#0F1420] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Active Staff Directory ({staffMembers.length} Cashiers)
              </span>
              <span className="text-[11px] text-slate-400">
                Staff can log in on the Business Terminal using their username & password
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {staffMembers.map((staff) => (
                <div
                  key={staff.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/30 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center text-sm">
                      <UserCheck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white">{staff.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {staff.role}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                            staff.active
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {staff.active ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Username: <span className="text-slate-200 font-semibold">{staff.username}</span> • {staff.email} • Assigned to: <strong className="text-amber-300">{staff.counter || 'Counter 1'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setResetTarget(staff);
                        setNewPasswordInput('');
                        setResetError('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1.5"
                      title="Reset employee login password"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset Pass</span>
                    </button>

                    <button
                      onClick={() => toggleStaffStatus(staff.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                        staff.active
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                      title={staff.active ? 'Suspend cashier account' : 'Reactivate cashier'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{staff.active ? 'Pause' : 'Activate'}</span>
                    </button>

                    <button
                      onClick={() => removeStaff(staff.id)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Cashier Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {staffMembers.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No cashiers onboarded yet. Click "Add New Cashier" above to create one.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: THEME & APPEARANCE */}
      {/* ============================================================== */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          
          {/* Display Mode (Dark vs Light) */}
          <div className="bg-[#131722] p-5 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Display Color Mode</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose between Dark Mode (designed for low-glare indoor store counters) or Light Mode (high contrast for bright environments).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Dark Mode (Default)</span>
                    {theme === 'dark' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Sleek dark slate palette, saves cashier eye strain during long billing shifts.
                  </p>
                </div>
              </button>

              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-sm">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Light Mode</span>
                    {theme === 'light' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Crisp white & slate retail terminal view with high contrast and maximum daylight readability.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Accent Color Palettes */}
          <div className="bg-[#131722] p-5 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>Store Theme Accent Color</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize your store's primary brand accent color across action buttons, active navigation, badges, and POS billing highlights.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {ACCENT_OPTIONS.map((c) => {
                const isCurrent = accentColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => changeAccentColor(c.id)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                        : 'border-slate-800 bg-[#0B0E14] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full inline-block shadow-md ring-2 ring-white/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-bold text-xs text-white">{c.name}</span>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">
                          SELECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">Apply</span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {c.desc}
                    </p>

                    <div className="pt-1 flex items-center gap-1.5">
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: c.hex }}
                      >
                        Sample Button
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                        style={{ color: c.hex, backgroundColor: `${c.hex}22` }}
                      >
                        #Badge
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ONBOARD NEW CASHIER */}
      {/* ============================================================== */}
      {isAddCashierOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddCashierOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black text-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Onboard New Cashier</h3>
                <p className="text-xs text-slate-400">Create employee credentials for counter terminal billing.</p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCashier} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cashier Full Name *</label>
                <input
                  type="text"
                  value={cashierForm.name}
                  onChange={(e) => setCashierForm({ ...cashierForm, name: e.target.value })}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Username / Terminal ID *</label>
                  <input
                    type="text"
                    value={cashierForm.username}
                    onChange={(e) => setCashierForm({ ...cashierForm, username: e.target.value })}
                    placeholder="e.g. suresh_counter1"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Work Email (Optional)</label>
                  <input
                    type="email"
                    value={cashierForm.email}
                    onChange={(e) => setCashierForm({ ...cashierForm, email: e.target.value })}
                    placeholder="suresh@apnabazar.in"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Billing Counter</label>
                <select
                  value={cashierForm.counter}
                  onChange={(e) => setCashierForm({ ...cashierForm, counter: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Counter 1 (Fast POS)">Counter 1 (Fast POS)</option>
                  <option value="Counter 2 (Express Lane)">Counter 2 (Express Lane)</option>
                  <option value="Counter 3 (General Grocery)">Counter 3 (General Grocery)</option>
                  <option value="Online Orders Packing Desk">Online Orders Packing Desk</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-300">Initial Password * (min 8 chars)</label>
                  <span className="text-[10px] text-slate-500 font-mono">Cashier can use this to sign in</span>
                </div>
                <input
                  type="text"
                  value={cashierForm.password}
                  onChange={(e) => setCashierForm({ ...cashierForm, password: e.target.value })}
                  placeholder="e.g. cashier123"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCashierOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition btn-press flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save & Register Cashier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RESET CASHIER PASSWORD (GAP-05) */}
      {/* ============================================================== */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setResetTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-lg flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Reset Cashier Password</h3>
                <p className="text-xs text-slate-400">
                  Set new password for <span className="text-white font-semibold">{resetTarget.name}</span> ({resetTarget.username})
                </p>
              </div>
            </div>

            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">New Password (Min. 6 chars)</label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="e.g. newCashierPass2026"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition btn-press flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
