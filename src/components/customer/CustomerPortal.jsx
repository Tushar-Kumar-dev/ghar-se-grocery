import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_ORDERS } from '../../data/initialData';
import { soundFx } from '../../services/audio';
import { StorageService } from '../../services/storage';
import { apiClient } from '../../services/api';
import {
  getCurrentGpsLocation,
  getNearbyKiranaStoresList,
  calculateStoresWithinRange
} from '../../services/locationService';
import {
  ShoppingBag,
  Bike,
  Camera,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Moon,
  Sun,
  LogOut,
  X,
  FileText,
  AlertTriangle,
  XCircle,
  CreditCard,
  History,
  User,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  RotateCcw,
  MessageCircle,
  Navigation
} from 'lucide-react';

// Client-Side Canvas Image Downscaler (CUST-03: Prevents localStorage QuotaExceededError)
const compressImage = (file, maxWidth = 1200, quality = 0.72) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const CustomerPortal = () => {
  const { isDeliveryActive, theme, toggleTheme, showToast, settings, khataCustomers } = useStore();
  const { currentUser, logout } = useAuth();

  // Customer Current Delivery Location (Default: Dwarka Sector 12)
  const [userLocation, setUserLocation] = useState({
    name: 'Sector 12, Dwarka, New Delhi',
    latitude: 28.5921,
    longitude: 77.0460
  });

  const [isDetectingUserGps, setIsDetectingUserGps] = useState(false);

  // Dynamic Stores Configuration: Calculate distance & strictly filter to <= 10 KM
  const rawStores = getNearbyKiranaStoresList(settings);
  const allCalculatedStores = calculateStoresWithinRange(
    rawStores,
    userLocation.latitude,
    userLocation.longitude,
    settings?.delivery?.maxRadiusKm || 10.0
  );

  // Sirf wahi stores dikhenge jo user ki location se 10 km ke daayre me hain
  const storesList = allCalculatedStores.filter((store) => store.isWithin10Km);

  // Selected Store ID (Defaults to nearest store within 10 km)
  const [selectedStoreId, setSelectedStoreId] = useState(1);
  const selectedStore = storesList.find((s) => s.id === selectedStoreId) || storesList[0] || null;

  // Backwards compatibility for setSelectedStore
  const setSelectedStore = (store) => {
    if (store && store.id) {
      setSelectedStoreId(store.id);
    }
  };

  // Browser GPS se customer ki live delivery location nikalna
  const handleDetectUserLocation = async () => {
    try {
      setIsDetectingUserGps(true);
      const coords = await getCurrentGpsLocation();
      setUserLocation({
        name: `Current Location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      showToast(`📍 Live location detect ho gayi: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`, 'success');
    } catch (err) {
      showToast(err.message || 'GPS location detect nahi ho saki.', 'warning');
    } finally {
      setIsDetectingUserGps(false);
    }
  };

  // Fulfillment Mode: 'delivery' | 'pickup'
  const [fulfillmentMode, setFulfillmentMode] = useState('delivery');

  // Grocery List Input Method: 'photo' | 'manual'
  const [listMethod, setListMethod] = useState('photo');
  const [uploadedParchiImg, setUploadedParchiImg] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [manualItems, setManualItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');

  // Live Grocery Items fetched from Spring Boot Backend (/api/products)
  const [storeCatalog, setStoreCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoadingCatalog(true);
        const prods = await apiClient.getProducts();
        if (Array.isArray(prods) && prods.length > 0) {
          setStoreCatalog(prods);
        }
      } catch (err) {
        console.warn('Customer portal live catalog fetch failed:', err);
      } finally {
        setLoadingCatalog(false);
      }
    };
    fetchCatalog();
  }, []);

  // Customer Contact Fields (Synced with logged-in user profile or clean empty fields)
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [pickupSlot, setPickupSlot] = useState('Today Evening (6:00 PM - 8:00 PM)');

  // Active Order Tracker Modal (Shows real ongoing customer order or null if fresh session)
  const [activeOrder, setActiveOrder] = useState(() => StorageService.getLatestCustomerOrder() || null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // My Orders History Modal (Real user past orders)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState(() => {
    const list = StorageService.getCustomerOrderHistory();
    return list && list.length > 0 ? list : [];
  });

  // Customer Profile Popover Modal (CUST-10)
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync customer details when currentUser logs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName) setCustomerName(currentUser.fullName);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);

  // CUST-07: Auto-switch to pickup if selected store does not support delivery
  useEffect(() => {
    const currentStoreConfig = storesList.find((s) => s.id === selectedStore.id);
    if (currentStoreConfig && !currentStoreConfig.deliveryAvailable && fulfillmentMode === 'delivery') {
      setFulfillmentMode('pickup');
      showToast(`${currentStoreConfig.name} currently offers In-Store Counter Pickup only`, 'info');
    }
  }, [isDeliveryActive, selectedStore.id, fulfillmentMode]);

  // Listen to order status updates from Store Admin in real time!
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'sibms_latest_customer_order') {
        const ord = StorageService.getLatestCustomerOrder();
        if (ord) {
          setActiveOrder(ord);
          setOrderHistory(StorageService.getCustomerOrderHistory());
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    const unsubscribe = StorageService.subscribeToBroadcast((msg) => {
      if (msg?.type === 'ORDER_STATUS_CHANGED') {
        const ord = msg.payload;
        setActiveOrder(ord);
        setOrderHistory(StorageService.getCustomerOrderHistory());
        soundFx.playSuccessChime();
        if (ord?.status === 'PACKING') {
          showToast('🔔 Your grocery list is accepted and we start working on it! 📦', 'success');
        } else if (ord?.status === 'OUT_FOR_DELIVERY') {
          showToast(`🛵 Order #${ord.orderId} is out for delivery with ${ord.riderName || 'delivery partner'}!`, 'info');
        } else if (ord?.status === 'READY_FOR_PICKUP') {
          showToast(`🛍️ Order #${ord.orderId} is ready for pickup at store counter!`, 'info');
        } else if (ord?.status === 'COMPLETED') {
          showToast(`🎉 Order #${ord.orderId} completed & delivered! Thank you!`, 'success');
        } else if (ord?.status === 'CANCELLED') {
          showToast(`⚠️ Order #${ord.orderId} cancelled: ${ord.cancelReason || 'Store rejected'}`, 'warning');
        }
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorage);
      unsubscribe();
    };
  }, []);

  // CUST-08: Check Customer Khata Credit Account
  const customerKhata = khataCustomers?.find((c) => {
    const phoneClean = customerPhone?.replace(/[^0-9]/g, '');
    const cPhoneClean = c.phone?.replace(/[^0-9]/g, '');
    const phoneMatch = phoneClean && cPhoneClean && phoneClean === cPhoneClean;
    const nameMatch = c.name && customerName && c.name.toLowerCase().includes(customerName.trim().toLowerCase().split(' ')[0]);
    return phoneMatch || nameMatch;
  });

  // CUST-03: Handle Photo Upload with Client-Side Canvas Compression
  const handleParchiUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedDataUrl = await compressImage(file, 1200, 0.72);
        setUploadedParchiImg(compressedDataUrl);
        soundFx.playScannerBeep();
        showToast('Parchi photo uploaded and optimized successfully!', 'success');
      } catch (err) {
        // Fallback
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedParchiImg(event.target.result);
          soundFx.playScannerBeep();
          showToast('Parchi photo uploaded!', 'success');
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Add Manual Item
  const handleAddManualItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      showToast('Kripya item ka naam likhein!', 'warning');
      return;
    }
    setManualItems((prev) => [
      ...prev,
      { id: Date.now(), name: newItemName.trim(), qty: newItemQty.trim() || '1 pc' }
    ]);
    setNewItemName('');
    setNewItemQty('');
  };

  const handleRemoveManualItem = (id) => {
    setManualItems((prev) => prev.filter((i) => i.id !== id));
  };

  // CUST-01, CUST-04, CUST-09, CUST-11: Submit Order with Full Validations
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Kripya apna poora Naam bharein!', 'error');
      soundFx.playBarcodeBeep();
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      showToast('Kripya 10-digit valid mobile number bharein!', 'error');
      soundFx.playBarcodeBeep();
      return;
    }

    // CUST-04: Delivery Address Validation
    if (fulfillmentMode === 'delivery' && (!address || address.trim().length < 8)) {
      showToast('Kripya poora delivery address bharein (House no, Gali, Area)!', 'error');
      soundFx.playBarcodeBeep();
      return;
    }

    // CUST-01: Non-Empty Order Validation
    if (listMethod === 'photo' && !uploadedParchiImg) {
      showToast('Kripya parchi ki photo upload karein ya "Type Items List" chunein!', 'error');
      soundFx.playBarcodeBeep();
      return;
    }

    if (listMethod === 'manual' && manualItems.length === 0) {
      showToast('Kripya kam se kam ek grocery item list me add karein!', 'error');
      soundFx.playBarcodeBeep();
      return;
    }

    if (!selectedStore) {
      showToast('Aapki location ke 10 km ke daayre me koi registered dukan nahi hai!', 'warning');
      soundFx.playBarcodeBeep();
      return;
    }

    soundFx.playSuccessChime();

    const orderData = {
      orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      storeName: selectedStore.name,
      storeCode: selectedStore.code,
      storePhone: selectedStore.phone,
      storeDistance: selectedStore.distanceText,
      customerLocation: userLocation.name,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      fulfillmentMode,
      address: fulfillmentMode === 'delivery' ? address.trim() : `Counter Pickup: ${pickupSlot}`,
      listType: listMethod === 'photo' ? 'Uploaded Parchi Photo' : 'Manual Items',
      parchiImg: uploadedParchiImg,
      itemsList: listMethod === 'manual' ? manualItems : null,
      itemsSummary:
        listMethod === 'photo'
          ? 'Customer uploaded handwritten grocery note (Parchi)'
          : manualItems.map((i) => `${i.name} (${i.qty})`).join(', '),
      estimatedTotal:
        listMethod === 'manual'
          ? manualItems.reduce((acc, it) => acc + (Number(it.price) || 140), 0)
          : 640,
      placedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING_REVIEW'
    };

    // 1. Sync with Spring Boot backend
    try {
      await apiClient.createCustomerOrder(orderData);
    } catch (err) {
      console.warn('Backend order sync fallback:', err);
    }

    // 2. Local reactive broadcast and state
    StorageService.updateCustomerOrder(orderData);
    setActiveOrder(orderData);
    setOrderHistory((prev) => [orderData, ...prev.filter((o) => o.orderId !== orderData.orderId)].slice(0, 30));
    setIsTrackerOpen(true);

    // CUST-11: Reset form state to avoid accidental duplicate submissions
    if (listMethod === 'photo') {
      setUploadedParchiImg(null);
    } else {
      setManualItems([]);
      setNewItemName('');
      setNewItemQty('');
    }

    showToast(`Order #${orderData.orderId} submitted to ${selectedStore.name}!`, 'success');
  };

  // Stepper calculations
  const step1 = true;
  const step2 = activeOrder && ['PACKING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'COMPLETED'].includes(activeOrder.status);
  const step3 = activeOrder && ['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'COMPLETED'].includes(activeOrder.status);
  const step4 = activeOrder?.status === 'COMPLETED';
  const isOrderCancelled = activeOrder?.status === 'CANCELLED';

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
      
      {/* CONSUMER HEADER */}
      <header className="h-16 bg-[#0E131F]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            GS
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
              GharSe Grocery
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Consumer Portal
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Delivering in <span className="text-slate-200 font-semibold">{selectedStore.area}</span>
            </p>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2.5">
          {/* Active Order Tracker Pill */}
          {activeOrder && (
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-pulse btn-press"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Track Order (#{activeOrder.orderId})</span>
            </button>
          )}

          {/* CUST-12: My Past Orders Button */}
          {orderHistory.length > 0 && (
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#141A28] border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition btn-press"
              title="View your past order receipts and history"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">My Orders ({orderHistory.length})</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#141A28] border border-slate-800 text-slate-400 hover:text-white transition"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* CUST-10: Customer Profile Button (Does NOT open Staff login) */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition text-left"
              title="View customer profile & Khata details"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                {(customerName || currentUser?.name || 'Customer').slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white">{customerName || currentUser?.name || 'Customer'}</div>
                <div className="text-[9px] font-mono text-emerald-400 font-semibold">{currentUser?.phone || 'Active Shopper'}</div>
              </div>
            </button>

            <button
              onClick={logout}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition btn-press"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONSUMER MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-[#131720] to-[#131720] border border-emerald-500/20 p-5 rounded-3xl relative overflow-hidden">
          <div className="max-w-xl space-y-1.5">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              Ghar Baithe Grocery Mangwao
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Kagaz ki Parchi ki Photo Kheecho ya Saman Type Karo
            </h2>
            <p className="text-xs text-slate-400">
              Apni local dukan chuno, parchi upload karo, aur dukan se direct doorstep delivery ya counter pickup paao.
            </p>
          </div>
        </div>

        {/* CUST-08: CUSTOMER KHATA STATUS CARD (IF REGISTERED REGULAR PATRON) */}
        {customerKhata && (
          <div className="bg-[#131720] border border-amber-500/30 bg-amber-500/5 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">Your Apna Bazar Khata Account (Udhar Ledger)</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Trusted Regular
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Linked to: <span className="text-white font-semibold">{customerKhata.name}</span> ({customerKhata.phone})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Outstanding Due</span>
                <span className={`text-base font-black ${customerKhata.due > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{customerKhata.due.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-l border-slate-800 pl-4 text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Credit Limit</span>
                <span className="text-base font-black text-white">
                  ₹{customerKhata.limit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: SELECT STORE (STRICT 10 KM RANGE ONLY) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Select Nearby Grocery Store</h3>
            </div>

            <div className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
              <span>📍 Within 10 KM:</span>
              <span className="font-extrabold">{storesList.length} Stores Available</span>
            </div>
          </div>

          {/* User Current Delivery Location Bar */}
          <div className="p-3.5 rounded-2xl bg-[#131720] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Your Delivery Location:</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-semibold">{userLocation.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  GPS: {userLocation.latitude.toFixed(4)}°N, {userLocation.longitude.toFixed(4)}°E • Sirf aapke 10 km ke daayre ke registered stores dikhenge
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDetectUserLocation}
              disabled={isDetectingUserGps}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 btn-press transition self-start sm:self-auto"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingUserGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingUserGps ? 'Detecting GPS...' : '📍 Auto-Detect My Location'}</span>
            </button>
          </div>

          {/* Kirana Stores Grid (Strictly Registered Stores <= 10 KM) */}
          {storesList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#131720] border border-slate-800 text-center space-y-2">
              <MapPin className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="font-bold text-sm text-white">Aapki location se 10 km ke daayre me koi registered dukan nahi mili</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Kripya "Auto-Detect My Location" par click karein taaki aapki sahi location ke aadhar par dukan mil sake.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {storesList.map((store) => {
                const isSelected = selectedStore && selectedStore.id === store.id;
                const isDelivOn = store.deliveryAvailable;

                return (
                  <div
                    key={store.id}
                    onClick={() => {
                      setSelectedStore(store);
                      showToast(`Selected: ${store.name} (${store.distanceText} away)`, 'success');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between btn-press ${
                      isSelected
                        ? 'bg-[#131720] border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
                        : 'bg-[#131720] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Distance & Selection Badge */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          📍 {store.distanceText} away
                        </span>

                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold text-slate-950 bg-emerald-400 px-2 py-0.5 rounded-full">
                            Selected ✓
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-sm flex items-center justify-between">
                        <span>{store.name}</span>
                        {store.rating && <span className="text-[11px] text-amber-400 font-mono">★ {store.rating}</span>}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{store.address}</p>
                    </div>

                    {/* Delivery SLA & Policy Info */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className={isDelivOn ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                          {isDelivOn ? `🚚 Delivery (~${store.sla || store.avgSlaMins || 30}m)` : '🚚 Delivery: OFF'}
                        </span>
                        <span className="text-cyan-400 font-semibold">🛍️ Pickup: ON</span>
                      </div>

                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>Min: ₹{store.minOrder || 300}</span>
                        <span>Fee: ₹{store.fee ?? store.deliveryFee ?? 30}</span>
                        <span>📞 {store.phone}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* STEP 2: CHOOSE FULFILLMENT MODE (DELIVERY VS PICKUP) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-white">Choose Fulfillment Mode</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Mode A: Home Delivery */}
            <div
              onClick={() => {
                if (selectedStore && !selectedStore.deliveryAvailable) {
                  showToast(`${selectedStore.name} has paused Home Delivery. Please choose Counter Pickup!`, 'warning');
                  return;
                }
                setFulfillmentMode('delivery');
              }}
              className={`p-4 rounded-2xl border transition-all btn-press ${
                selectedStore && !selectedStore.deliveryAvailable
                  ? 'opacity-50 cursor-not-allowed bg-[#131720] border-slate-800'
                  : fulfillmentMode === 'delivery'
                  ? 'bg-emerald-500/15 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 cursor-pointer'
                  : 'bg-[#131720] border-slate-800 hover:border-slate-700 cursor-pointer'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Doorstep Home Delivery</h4>
                    <p className="text-xs text-slate-400">
                      Delivered in ~{selectedStore?.sla || 35} mins • Delivery Fee: ₹{selectedStore?.fee || 30}
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${fulfillmentMode === 'delivery' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                  {fulfillmentMode === 'delivery' && <span className="w-2 h-2 rounded-full bg-slate-950"></span>}
                </div>
              </div>

              {selectedStore && !selectedStore.deliveryAvailable && (
                <div className="mt-2.5 p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Store has temporarily paused Home Delivery. In-store pickup available.</span>
                </div>
              )}
            </div>

            {/* Mode B: Counter Pickup */}
            <div
              onClick={() => setFulfillmentMode('pickup')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all btn-press ${
                fulfillmentMode === 'pickup'
                  ? 'bg-cyan-500/15 border-2 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'bg-[#131720] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">In-Store Counter Pickup</h4>
                    <p className="text-xs text-slate-400">Items packed in bag. Skip billing queue & collect</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${fulfillmentMode === 'pickup' ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'}`}>
                  {fulfillmentMode === 'pickup' && <span className="w-2 h-2 rounded-full bg-slate-950"></span>}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* STEP 3: PROVIDE GROCERY LIST (PHOTO PARCHI VS MANUAL) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Provide Your Grocery List</h3>
            </div>

            {/* Switch Tabs */}
            <div className="flex rounded-xl bg-[#131720] p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setListMethod('photo')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  listMethod === 'photo' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Parchi Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setListMethod('manual')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  listMethod === 'manual' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Type Items List</span>
              </button>
            </div>
          </div>

          {/* TAB A: UPLOAD PARCHI PHOTO (CUST-03: With Canvas Downscaler) */}
          {listMethod === 'photo' && (
            <div className="bg-[#131720] p-5 rounded-2xl border border-slate-800 space-y-4">
              {!uploadedParchiImg ? (
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 text-center cursor-pointer transition relative group bg-[#0B0E14]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleParchiUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {isCompressing ? 'Optimizing Parchi Image...' : 'Click or Tap to Upload Parchi Photo'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Take photo of handwritten grocery list on paper</p>
                  <span className="inline-block mt-3 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono">
                    High-Res Smartphone Camera Supported (Auto-Compressed)
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Handwritten Parchi Attached Successfully</span>
                    </span>
                    <button
                      onClick={() => setUploadedParchiImg(null)}
                      className="text-rose-400 hover:text-rose-300 font-bold underline"
                    >
                      Remove / Retake
                    </button>
                  </div>

                  <div className="border border-slate-800 rounded-2xl p-3 bg-[#0B0E14] flex justify-center">
                    <img
                      src={uploadedParchiImg}
                      alt="Uploaded Parchi"
                      className="max-h-[300px] rounded-lg shadow-md border border-slate-700 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB B: TYPE MANUAL ITEMS & LIVE STORE INVENTORY CATALOG */}
          {listMethod === 'manual' && (
            <div className="bg-[#131720] p-5 rounded-2xl border border-slate-800 space-y-4">
              <form onSubmit={handleAddManualItem} className="flex gap-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name (e.g. Aashirvaad Atta, Fortune Oil)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  placeholder="Qty (5kg, 1L)..."
                  className="w-28 px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 btn-press"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Quick-Add Directly From Backend Grocery Catalog */}
              {storeCatalog.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live Store Catalog (Backend Synchronized)</span>
                    </span>
                    <span>{storeCatalog.length} items available</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                    {storeCatalog.slice(0, 15).map((prod) => {
                      const isAlreadyAdded = manualItems.some((i) => i.name === prod.name);
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => {
                            if (isAlreadyAdded) return;
                            setManualItems((prev) => [
                              ...prev,
                              {
                                id: Date.now() + Math.random(),
                                name: prod.name,
                                qty: prod.pack || '1 pc',
                                price: prod.price || 0
                              }
                            ]);
                          }}
                          disabled={isAlreadyAdded}
                          className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition btn-press ${
                            isAlreadyAdded
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-60 cursor-default'
                              : 'bg-[#0B0E14] border-slate-700 hover:border-emerald-500/60 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="font-medium">{prod.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">({prod.pack || '1 pc'})</span>
                          <span className="text-[10px] text-slate-400">₹{prod.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {manualItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-[#0B0E14] px-3 py-2 rounded-xl border border-slate-800 text-xs"
                  >
                    <span className="font-medium text-slate-200">
                      • {item.name} <strong className="font-mono text-emerald-400">({item.qty})</strong>
                    </span>
                    <button
                      onClick={() => handleRemoveManualItem(item.id)}
                      className="text-rose-400 hover:text-rose-300 font-bold p-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}

                {manualItems.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No items added yet. Click any item above or type item name & quantity to add.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* STEP 4: CONTACT & SUBMIT ORDER */}
        <section className="bg-[#131720] p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-white">Contact & Delivery Details</h3>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Your Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {fulfillmentMode === 'delivery' ? (
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Complete Delivery Address *</label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Flat No, Gali No, Landmark, Sector..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Pickup Time Slot</label>
                <select
                  value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Today Evening (6:00 PM - 8:00 PM)">Today Evening (6:00 PM - 8:00 PM)</option>
                  <option value="Today Late Evening (8:00 PM - 10:00 PM)">Today Late Evening (8:00 PM - 10:00 PM)</option>
                  <option value="Tomorrow Morning (8:00 AM - 11:00 AM)">Tomorrow Morning (8:00 AM - 11:00 AM)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedStore}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 btn-press transition mt-3"
            >
              <span>{selectedStore ? `Send Grocery Order to ${selectedStore.name}` : 'No Store in 10 KM Range'}</span>
            </button>
          </form>
        </section>

      </main>

      {/* CUST-02 & CUST-05: LIVE ORDER TRACKER MODAL */}
      {isTrackerOpen && activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131720] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            
            <button
              onClick={() => setIsTrackerOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                LIVE ORDER TRACKER
              </span>
              <h3 className="font-extrabold text-lg text-white mt-1">
                Order #{activeOrder.orderId}
              </h3>
              <p className="text-xs text-slate-400">
                Target Store: <strong className="text-white">{activeOrder.storeName}</strong>
              </p>
            </div>

            {/* Live Step-by-Step Notification Banner */}
            {activeOrder.status === 'PACKING' && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-extrabold text-xs text-white">Your grocery list is accepted and we start working on it! 📦</span>
                </div>
                <p className="text-[11px] text-emerald-300/90 pl-4.5">
                  Store staff is currently reviewing, weighing, and packing your items.
                </p>
              </div>
            )}

            {activeOrder.status === 'OUT_FOR_DELIVERY' && (
              <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-extrabold text-xs text-white">Order Dispatched for Doorstep Delivery! 🛵</span>
                </div>
                <p className="text-[11px] text-cyan-300/90 pl-4.5">
                  Rider {activeOrder.riderName ? `(${activeOrder.riderName})` : ''} is on the way. Please keep cash or direct UPI ready.
                </p>
              </div>
            )}

            {activeOrder.status === 'READY_FOR_PICKUP' && (
              <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-extrabold text-xs text-white">Your Grocery Bag is Ready at Counter #1! 🛍️</span>
                </div>
                <p className="text-[11px] text-cyan-300/90 pl-4.5">
                  Skip the billing line and collect your packed bag directly from store counter.
                </p>
              </div>
            )}

            {activeOrder.status === 'COMPLETED' && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-xs text-white">Order Completed & Delivered! 🎉</span>
                </div>
                <p className="text-[11px] text-emerald-300/90 pl-4.5">
                  Thank you for shopping at Apna Bazar Supermarket!
                </p>
              </div>
            )}

            {/* CUST-02: DEDICATED ORDER CANCELLED ALERT BANNER */}
            {isOrderCancelled ? (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Order Cancelled by Store</h4>
                    <p className="text-xs text-rose-300 mt-0.5">
                      Reason: <strong>{activeOrder.cancelReason || 'Requested items are temporarily out of stock'}</strong>
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Please call the grocer to replace items or place a revised order.
                </p>
              </div>
            ) : (
              /* Normal 4-Step Stepper Progress */
              <div className="space-y-4 py-2 border-y border-slate-800">
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">1. Order Reached Store Counter</p>
                    <p className="text-[11px] text-slate-400">Placed at {activeOrder.placedAt}</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${step2 ? '' : 'opacity-40'}`}>
                  <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${step2 ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    {step2 ? '2' : '2'}
                  </div>
                  <div>
                    <p className={`font-bold text-xs ${step2 ? 'text-amber-400' : 'text-slate-400'}`}>
                      2. Staff Reviewing & Packing Items
                    </p>
                    <p className="text-[11px] text-slate-400">Store clerk weighing fresh stock</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${step3 ? '' : 'opacity-40'}`}>
                  <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${step3 ? 'bg-cyan-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    {step3 ? '3' : '3'}
                  </div>
                  <div>
                    <p className={`font-bold text-xs ${step3 ? 'text-cyan-400' : 'text-slate-400'}`}>
                      3. {activeOrder.fulfillmentMode === 'delivery' ? 'Out for Doorstep Delivery' : 'Bag Ready at Counter #1'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {activeOrder.fulfillmentMode === 'delivery' ? 'Rider on the way' : 'Skip line & collect bag'}
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${step4 ? '' : 'opacity-40'}`}>
                  <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${step4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    {step4 ? '✓' : '4'}
                  </div>
                  <div>
                    <p className={`font-bold text-xs ${step4 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      4. Order Completed & Delivered
                    </p>
                    <p className="text-[11px] text-slate-400">Payment settled</p>
                  </div>
                </div>

              </div>
            )}

            {/* CUST-05: Assigned Rider Details Banner */}
            {activeOrder.fulfillmentMode === 'delivery' && activeOrder.riderName && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white">Assigned Delivery Rider</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                    EN ROUTE
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <div className="font-extrabold text-white">{activeOrder.riderName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{activeOrder.riderPhone || 'Contact store'}</div>
                  </div>
                  {activeOrder.riderPhone && (
                    <a
                      href={`tel:${activeOrder.riderPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Rider</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Details */}
            <div className="p-3 bg-[#0B0E14] rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Fulfillment:</span>
                <span className="text-emerald-400 font-bold">
                  {activeOrder.fulfillmentMode === 'delivery' ? 'Doorstep Delivery' : 'In-Store Pickup'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">List Format:</span>
                <span className="text-slate-200">{activeOrder.listType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Total:</span>
                <span className="text-emerald-400 font-bold">₹{activeOrder.estimatedTotal || 640}</span>
              </div>
            </div>

            {/* Direct WhatsApp Chat with Store */}
            <a
              href={`https://wa.me/91${(selectedStore.phone || '9811234567').replace(/\D/g, '')}?text=${encodeURIComponent(`Namaste! Main Apna Bazar customer bol raha/rahi hoon. Mera grocery order #${activeOrder.orderId} hai.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition btn-press"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Open WhatsApp Chat with Store</span>
            </a>

            {/* CUST-09: Action Bar Without Native Alert */}
            <div className="flex gap-2 pt-1">
              <a
                href={`tel:${selectedStore.phone || '+91 11-49827361'}`}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 btn-press"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Store</span>
              </a>
              <button
                onClick={() => setIsTrackerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold btn-press"
              >
                Close Tracker
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CUST-12: MY ORDERS HISTORY DRAWER MODAL */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131720] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">My Past Grocery Orders</h3>
                <p className="text-xs text-slate-400">Review receipts and track active deliveries.</p>
              </div>
            </div>

            <div className="space-y-3">
              {orderHistory.map((ord) => (
                <div
                  key={ord.orderId}
                  className="p-3.5 rounded-2xl bg-[#0B0E14] border border-slate-800 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          #{ord.orderId}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{ord.storeName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Placed at {ord.placedAt} • {ord.fulfillmentMode === 'delivery' ? 'Doorstep Delivery' : 'In-Store Pickup'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        ord.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : ord.status === 'CANCELLED'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium truncate">
                    {ord.itemsSummary}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-bold">
                      Est. Total: ₹{ord.estimatedTotal || 640}
                    </span>
                    <button
                      onClick={() => {
                        setActiveOrder(ord);
                        setIsHistoryOpen(false);
                        setIsTrackerOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 btn-press"
                    >
                      <span>View Tracker</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUST-10: CUSTOMER PROFILE POPOVER MODAL */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131720] border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-base font-black">
                {customerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">{customerName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Verified Consumer Account
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-slate-200">{customerPhone}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200 leading-relaxed">{address}</span>
              </div>
            </div>

            {customerKhata && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono space-y-1">
                <div className="flex justify-between text-amber-300 font-bold">
                  <span>Khata Due:</span>
                  <span>₹{customerKhata.due.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Credit Limit:</span>
                  <span>₹{customerKhata.limit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={logout}
                className="w-full py-2.5 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition btn-press"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout from GharSe</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
