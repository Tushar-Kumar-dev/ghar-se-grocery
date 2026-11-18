import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Store, Volume2, VolumeX, Moon, Sun, ShieldCheck, UserCheck, LogOut, KeyRound, Palette, Check } from 'lucide-react';

const ACCENT_COLORS = [
  { id: 'emerald', name: 'Emerald Green', hex: '#10B981' },
  { id: 'blue', name: 'Sapphire Blue', hex: '#2563EB' },
  { id: 'purple', name: 'Royal Purple', hex: '#8B5CF6' },
  { id: 'cyan', name: 'Ocean Cyan', hex: '#06B6D4' },
  { id: 'amber', name: 'Warm Amber', hex: '#F59E0B' },
  { id: 'rose', name: 'Crimson Rose', hex: '#F43F5E' },
];

export const Header = () => {
  const {
    isDeliveryActive,
    toggleDeliveryActive,
    audioEnabled,
    toggleAudio,
    theme,
    toggleTheme,
    accentColor,
    changeAccentColor,
    settings,
    backendOnline,
    showToast
  } = useStore();

  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const { currentUser, isManager, isCashier, logout, setIsLoginModalOpen } = useAuth();

  const handleDeliveryToggleClick = () => {
    if (!isManager) {
      showToast('⚠️ Authorization Denied: Only Store Manager can pause or activate store delivery policy.', 'warning');
      return;
    }
    toggleDeliveryActive();
  };

  return (
    <header className="h-16 bg-[#0E131F]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      
      {/* Left: Store Identity */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Store className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              {settings.storeName}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              #{settings.storeCode}
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`}></span>
              {backendOnline ? 'SPRING BOOT CONNECTED' : 'STORE TERMINAL ONLINE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {settings.address} • GSTIN: <span className="font-mono text-slate-300">{settings.gstin}</span>
          </p>
        </div>
      </div>

      {/* Right Controls: Delivery Master Switch, Audio, Theme, Auth Profile */}
      <div className="flex items-center gap-3">

        {/* MASTER STORE HOME DELIVERY HARDWARE SWITCH (RBAC PROTECTED) */}
        <div className="flex items-center gap-2.5 bg-[#141A28] border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-bold tracking-wide uppercase flex items-center justify-end gap-1.5">
              <span
                className={`w-2 h-2 rounded-full shadow-sm ${
                  isDeliveryActive
                    ? 'bg-emerald-400 shadow-emerald-400/80'
                    : 'bg-amber-400 shadow-amber-400/80'
                }`}
              ></span>
              <span className={isDeliveryActive ? 'text-emerald-400' : 'text-amber-400'}>
                {isDeliveryActive ? 'Home Delivery ACTIVE' : 'Home Delivery PAUSED'}
              </span>
            </div>
            <div className="text-[9px] text-slate-400">
              {isDeliveryActive ? 'Accepting Online Parchi & Orders' : 'In-Store Pickup Only'}
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleDeliveryToggleClick}
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm ${
              isDeliveryActive ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-700'
            }`}
            title={isManager ? 'Toggle Store Home Delivery Availability' : 'Locked: Store Manager Only'}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isDeliveryActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Audio FX Button */}
        <button
          onClick={toggleAudio}
          className="p-2 rounded-xl bg-[#141A28] border border-slate-800 text-slate-400 hover:text-white transition btn-press"
          title={audioEnabled ? 'Mute Scanner & Chimes' : 'Enable Scanner & Chimes'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Theme Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[#141A28] border border-slate-800 text-slate-400 hover:text-white transition btn-press"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Theme Accent Color Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
            className="p-2 rounded-xl bg-[#141A28] border border-slate-800 text-slate-400 hover:text-white transition btn-press flex items-center gap-1.5"
            title="Choose Theme Accent Color"
          >
            <Palette className="w-4 h-4 text-slate-400" />
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: ACCENT_COLORS.find((c) => c.id === accentColor)?.hex || '#10B981' }}
            />
          </button>

          {isColorMenuOpen && (
            <div className="absolute right-0 mt-2 p-2 bg-[#131722] border border-slate-800 rounded-2xl shadow-2xl z-50 flex items-center gap-2 min-w-max">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    changeAccentColor(c.id);
                    setIsColorMenuOpen(false);
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-sm ${
                    accentColor === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} Theme`}
                >
                  {accentColor === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) PROFILE */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition text-left"
              title="Click to Switch Role or Re-authenticate"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                  isManager
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                }`}
              >
                {isManager ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <UserCheck className="w-4 h-4 text-cyan-400" />}
              </div>

              <div className="hidden lg:block">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{currentUser.fullName}</span>
                </div>
                <div
                  className={`text-[9px] font-mono font-bold tracking-tight ${
                    isManager ? 'text-emerald-400' : 'text-cyan-400'
                  }`}
                >
                  {currentUser.roleLabel.toUpperCase()}
                </div>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition btn-press"
              title="Sign Out & Lock Terminal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 btn-press shadow-md shadow-emerald-500/20"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

      </div>

    </header>
  );
};