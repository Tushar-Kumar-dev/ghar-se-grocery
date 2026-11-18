import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_KHATA, INITIAL_PO, INITIAL_SETTINGS, DEFAULT_CATEGORIES } from '../data/initialData';
import { soundFx } from '../services/audio';
import { StorageService } from '../services/storage';
import { apiClient } from '../services/api';

// Ensure clean slate reset of legacy dummy data from previous sessions
const CLEAN_SLATE_KEY = 'sibms_scratch_clean_v2';
if (typeof window !== 'undefined' && localStorage.getItem('sibms_clean_version') !== CLEAN_SLATE_KEY) {
  localStorage.removeItem('sibms_products');
  localStorage.removeItem('sibms_inward_orders');
  localStorage.removeItem('sibms_khata_customers');
  localStorage.removeItem('sibms_staff_members');
  localStorage.removeItem('sibms_held_bills');
  localStorage.removeItem('sibms_latest_customer_order');
  localStorage.removeItem('sibms_customer_order_history');
  localStorage.setItem('sibms_clean_version', CLEAN_SLATE_KEY);
}

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState('pos');

  // Theme (Dark / Light)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('sibms_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Theme Accent Color (emerald, blue, purple, cyan, amber, rose)
  const [accentColor, setAccentColor] = useState(() => {
    try {
      return localStorage.getItem('sibms_accent_color') || 'emerald';
    } catch {
      return 'emerald';
    }
  });

  // Sync Theme with DOM and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sibms_theme', theme);
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    } catch {}
  }, [theme]);

  // Sync Accent Color with DOM and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sibms_accent_color', accentColor);
      document.documentElement.setAttribute('data-accent', accentColor);
    } catch {}
  }, [accentColor]);

  // Audio FX toggle
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Master Store Delivery Service Switch
  const [isDeliveryActive, setIsDeliveryActive] = useState(() => StorageService.getDeliveryState());

  // Backend connection status
  const [backendOnline, setBackendOnline] = useState(false);

  // Products & Inventory (Fetched directly from Spring Boot Backend /api/products)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('sibms_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sibms_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('sibms_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sibms_categories', JSON.stringify(categories));
    } catch {}
  }, [categories]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Active POS Cart
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('walkin');
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('CASH');

  // Parked / Held POS Bills (Store Counter Multitasking)
  const [heldBills, setHeldBills] = useState(() => {
    try {
      const saved = localStorage.getItem('sibms_held_bills');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sibms_held_bills', JSON.stringify(heldBills));
    } catch {}
  }, [heldBills]);

  // Inward Online Orders
  const [inwardOrders, setInwardOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('sibms_inward_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });

  // Khata Customers
  const [khataCustomers, setKhataCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('sibms_khata_customers');
      return saved ? JSON.parse(saved) : INITIAL_KHATA;
    } catch {
      return INITIAL_KHATA;
    }
  });

  // Purchase Orders
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PO);

  // Store Settings (Store Manager can update name, address, GPS location & delivery radius)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('sibms_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          latitude: parsed.latitude ?? INITIAL_SETTINGS.latitude,
          longitude: parsed.longitude ?? INITIAL_SETTINGS.longitude,
          delivery: {
            ...INITIAL_SETTINGS.delivery,
            ...(parsed.delivery || {})
          }
        };
      }
    } catch {}
    return INITIAL_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sibms_store_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Initial Cashiers / Staff Members List (Clean slate: Manager creates cashiers from scratch)
  const INITIAL_STAFF = [];

  // Staff & Cashiers state (Managed by Store Manager)
  const [staffMembers, setStaffMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('sibms_staff_members');
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sibms_staff_members', JSON.stringify(staffMembers));
    } catch {}
  }, [staffMembers]);

  // Today KPIs (Starts at 0 for fresh store operations)
  const [todayStats, setTodayStats] = useState({
    billsCount: 0,
    salesTotal: 0
  });

  // Modals state
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [activeParchiOrder, setActiveParchiOrder] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Load / Refresh Products & Categories from Spring Boot Backend
  const refreshProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const [backendProducts, backendCats] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCategories()
      ]);
      if (Array.isArray(backendProducts) && backendProducts.length > 0) {
        setProducts(backendProducts);
      }
      if (Array.isArray(backendCats) && backendCats.length > 0) {
        setCategories((prev) => Array.from(new Set([...DEFAULT_CATEGORIES, ...backendCats, ...prev])));
      }
    } catch (e) {
      console.warn('Backend products refresh error:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Check Backend Status & Sync initial data
  useEffect(() => {
    const initBackendSync = async () => {
      try {
        const isUp = await apiClient.checkHealth();
        setBackendOnline(isUp);
        if (isUp) {
          // Sync Store Delivery Status
          const deliveryInfo = await apiClient.getStoreDeliveryStatus();
          if (deliveryInfo && typeof deliveryInfo.active === 'boolean') {
            setIsDeliveryActive(deliveryInfo.active);
            StorageService.setDeliveryState(deliveryInfo.active, deliveryInfo.storeName || 'Apna Bazar Supermarket');
          }

          // Sync Inward Orders from Backend
          const backendOrders = await apiClient.getCustomerOrders();
          if (Array.isArray(backendOrders) && backendOrders.length > 0) {
            setInwardOrders((prev) => {
              const backendMap = new Map(backendOrders.map(o => [o.orderId, o]));
              const merged = [...backendOrders];
              prev.forEach(p => {
                if (!backendMap.has(p.orderId)) {
                  merged.push(p);
                }
              });
              return merged;
            });
          }
        }

        // Always fetch latest products from backend
        await refreshProducts();
      } catch (e) {
        console.warn('Initial backend sync skipped:', e);
        setIsLoadingProducts(false);
      }
    };

    initBackendSync();
  }, []);

  // Save products when modified
  useEffect(() => {
    try {
      localStorage.setItem('sibms_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  // Save inward orders when modified
  useEffect(() => {
    try {
      localStorage.setItem('sibms_inward_orders', JSON.stringify(inwardOrders));
    } catch {}
  }, [inwardOrders]);

  // Save khata customers when modified
  useEffect(() => {
    try {
      localStorage.setItem('sibms_khata_customers', JSON.stringify(khataCustomers));
    } catch {}
  }, [khataCustomers]);

  // Audio toggle
  const toggleAudio = () => {
    const next = soundFx.toggle();
    setAudioEnabled(next);
    showToast(next ? 'Sound FX Enabled' : 'Sound FX Muted', 'info');
  };

  // Theme toggle
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
  };

  // Accent theme color
  const changeAccentColor = (newColor) => {
    setAccentColor(newColor);
    showToast(`Theme accent updated to ${newColor.toUpperCase()}`, 'success');
  };

  // Delivery toggle for store
  const toggleDeliveryActive = async () => {
    const next = !isDeliveryActive;
    setIsDeliveryActive(next);
    StorageService.setDeliveryState(next, settings.storeName);

    // Sync with Spring Boot backend
    try {
      await apiClient.toggleStoreDelivery(next);
    } catch (e) {
      console.warn('Backend toggle store delivery sync failed:', e);
    }

    if (next) {
      showToast('Home Delivery is now ACTIVE for this store', 'success');
    } else {
      showToast('Home Delivery PAUSED. Customers will be restricted to Counter Pickup', 'warning');
    }
  };

  // Sync incoming orders from localStorage / BroadcastChannel
  const checkIncomingOrders = () => {
    const latest = StorageService.getLatestCustomerOrder();
    if (latest) {
      setInwardOrders((prev) => {
        const exists = prev.some((o) => o.orderId === latest.orderId);
        if (!exists) {
          soundFx.playOrderBell();
          showToast(`🔔 New Inward Order from ${latest.customerName}! (${latest.fulfillmentMode === 'delivery' ? 'Home Delivery' : 'Pickup'})`, 'success');
          return [latest, ...prev];
        }
        return prev;
      });
    }
  };

  // Periodic check & window storage listener for cross-tab sync
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'sibms_latest_customer_order') {
        checkIncomingOrders();
      }
      if (e.key === 'sibms_store_delivery_active') {
        setIsDeliveryActive(StorageService.getDeliveryState());
      }
    };

    window.addEventListener('storage', handleStorage);
    const unsubscribeBroadcast = StorageService.subscribeToBroadcast((msg) => {
      if (msg?.type === 'DELIVERY_TOGGLED') {
        setIsDeliveryActive(msg.payload.active);
      }
      if (msg?.type === 'ORDER_STATUS_CHANGED') {
        setInwardOrders((prev) =>
          prev.map((o) => (o.orderId === msg.payload.orderId ? msg.payload : o))
        );
      }
    });

    const interval = setInterval(checkIncomingOrders, 3000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      unsubscribeBroadcast();
      clearInterval(interval);
    };
  }, []);

  // Keyboard Shortcuts (F2, F4, F8, F9, F10)
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('orders');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setActiveTab('khata');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setActiveTab('po');
      } else if (e.key === 'F10') {
        e.preventDefault();
        setActiveTab('inventory');
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // POS Actions
  const addToCart = (prodId) => {
    soundFx.playScannerBeep();
    setCart((prev) => {
      const existing = prev.find((i) => i.id === prodId);
      if (existing) {
        return prev.map((i) => (i.id === prodId ? { ...i, qty: i.qty + 1 } : i));
      } else {
        const prod = products.find((p) => p.id === prodId);
        if (!prod) return prev;
        return [
          ...prev,
          {
            id: prod.id,
            name: prod.name,
            brand: prod.brand,
            price: prod.price,
            qty: 1,
            gstRate: prod.gstRate || 0.05
          }
        ];
      }
    });
  };

  const changeCartQty = (prodId, delta) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.id === prodId) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (prodId) => {
    setCart((prev) => prev.filter((i) => i.id !== prodId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  // POS Totals Calculation
  const getCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const gst = subtotal * 0.05; // 5% GST combined
    const disc = Math.max(0, parseFloat(discount) || 0);
    const grandTotal = Math.max(0, Math.round(subtotal + gst - disc));
    return { subtotal, gst, discount: disc, grandTotal };
  };

  // Complete Invoice & Generate Receipt
  const completeInvoice = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty! Scan or select products to bill.', 'error');
      return;
    }

    // GAP-02: Enforce Customer Selection for Khata Payment
    if (paymentMode === 'KHATA' && (selectedCustomer === 'walkin' || !selectedCustomer)) {
      showToast('Khata payment ke liye customer select karna zaroori hai! Kripya customer list se select karein.', 'error');
      soundFx.playBarcodeBeep();
      return;
    }

    soundFx.playSuccessChime();
    const totals = getCartTotals();
    const invNumber = 'INV-2026-' + Math.floor(9000 + Math.random() * 999);

    let customerLabel = 'Walk-in Cash';
    let customerObj = null;
    if (selectedCustomer !== 'walkin') {
      customerObj = khataCustomers.find((c) => c.id === parseInt(selectedCustomer));
      if (customerObj) {
        customerLabel = customerObj.name;
        // If payment mode is KHATA, add to customer due
        if (paymentMode === 'KHATA') {
          setKhataCustomers((prev) =>
            prev.map((c) =>
              c.id === customerObj.id
                ? { ...c, due: c.due + totals.grandTotal, lastPay: 'Billed' }
                : c
            )
          );
          showToast(`₹${totals.grandTotal} charged to ${customerObj.name}'s Khata account!`, 'warning');
        }
      }
    }

    // GAP-03: Persist Invoice to Spring Boot Backend MySQL
    try {
      const invoicePayload = {
        customerId: customerObj ? customerObj.id : null,
        discount: totals.discount || 0,
        items: cart.map((item) => ({
          productId: Number(item.id) || 1,
          qty: item.qty,
          rate: item.price,
          discount: 0,
          gstPercent: item.gstRate ? item.gstRate * 100 : 5
        })),
        payments: [
          {
            mode: paymentMode === 'KHATA' ? 'CREDIT' : paymentMode,
            amount: totals.grandTotal
          }
        ]
      };
      await apiClient.createInvoice(invoicePayload);
    } catch (e) {
      console.warn('Backend invoice create fallback:', e);
    }

    const receipt = {
      invoiceNumber: invNumber,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN'),
      customerName: customerLabel,
      paymentMode,
      items: [...cart],
      ...totals
    };

    // Update today KPIs
    setTodayStats((prev) => ({
      billsCount: prev.billsCount + 1,
      salesTotal: prev.salesTotal + totals.grandTotal
    }));

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = cart.find((c) => c.id === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.qty) };
        }
        return p;
      })
    );

    setActiveReceipt(receipt);
    clearCart();
    showToast(`Invoice ${invNumber} generated & registered!`, 'success');
  };

  // GAP-12: Park / Hold POS Bill
  const parkCurrentBill = (note = '') => {
    if (cart.length === 0) {
      showToast('Cannot hold an empty cart!', 'error');
      return;
    }
    soundFx.playBarcodeBeep();
    const totals = getCartTotals();
    const heldId = 'HOLD-' + Math.floor(100 + Math.random() * 900);
    const heldItem = {
      id: heldId,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      customer: selectedCustomer,
      customerName:
        selectedCustomer !== 'walkin'
          ? khataCustomers.find((c) => c.id === parseInt(selectedCustomer))?.name || 'Customer'
          : 'Walk-in',
      note: note.trim() || 'Held Counter Bill',
      cart: [...cart],
      discount,
      paymentMode,
      totals
    };

    setHeldBills((prev) => [heldItem, ...prev]);
    clearCart();
    setSelectedCustomer('walkin');
    showToast(`Bill parked as #${heldId}! Counter free for next customer.`, 'info');
  };

  const resumeBill = (heldId) => {
    const item = heldBills.find((b) => b.id === heldId);
    if (!item) return;

    if (cart.length > 0) {
      const confirmReplace = window.confirm(
        'Current counter has unbilled items. Replace cart with this held bill?'
      );
      if (!confirmReplace) return;
    }

    soundFx.playSuccessChime();
    setCart(item.cart);
    setDiscount(item.discount || 0);
    setPaymentMode(item.paymentMode || 'CASH');
    if (item.customer) setSelectedCustomer(item.customer);
    setHeldBills((prev) => prev.filter((b) => b.id !== heldId));
    showToast(`Resumed parked bill #${heldId}!`, 'success');
  };

  const discardHeldBill = (heldId) => {
    setHeldBills((prev) => prev.filter((b) => b.id !== heldId));
    showToast(`Parked bill #${heldId} discarded`, 'warning');
  };

  // GAP-08 & GAP-11: Inward Orders Actions (with Rider & Cancellation Reason)
  const updateOrderStatus = async (orderId, newStatus, riderInfo = null, cancelReason = '') => {
    soundFx.playSuccessChime();
    setInwardOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.orderId === orderId) {
          const mod = {
            ...ord,
            status: newStatus,
            ...(riderInfo ? { riderName: riderInfo.name, riderPhone: riderInfo.phone } : {}),
            ...(cancelReason ? { cancelReason } : {})
          };
          StorageService.updateCustomerOrder(mod);
          return mod;
        }
        return ord;
      });
      return updated;
    });

    // Sync with Spring Boot backend
    try {
      const note = cancelReason || (riderInfo ? `Rider: ${riderInfo.name} (${riderInfo.phone})` : '');
      await apiClient.updateCustomerOrderStatus(orderId, newStatus, note);
    } catch (e) {
      console.warn('Backend order status update failed:', e);
    }

    if (newStatus === 'CANCELLED') {
      showToast(`Order #${orderId} CANCELLED: ${cancelReason || 'Store Rejected'}`, 'warning');
    } else {
      showToast(`Order #${orderId} moved to: ${newStatus}`, 'success');
    }
  };

  // Clear all inward orders
  const clearAllInwardOrders = () => {
    setInwardOrders([]);
    try {
      localStorage.removeItem('sibms_inward_orders');
      localStorage.removeItem('sibms_latest_customer_order');
      localStorage.removeItem('sibms_customer_order_history');
    } catch {}
    showToast('All inward orders cleared successfully!', 'info');
  };

  // Khata Actions
  const recordKhataPayment = (customerId, amount) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    soundFx.playSuccessChime();
    setKhataCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newDue = Math.max(0, c.due - val);
          return { ...c, due: newDue, lastPay: 'Today' };
        }
        return c;
      })
    );
    showToast(`Payment of ₹${val} credited to customer account!`, 'success');
  };

  // Inventory Actions
  const adjustStock = (prodId, delta) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === prodId) {
          const nextStock = Math.max(0, p.stock + delta);
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );
    showToast(`Inventory stock adjusted`, 'info');
  };

  // Category Management
  const addCategory = async (catName) => {
    const trimmed = (catName || '').trim();
    if (!trimmed) return;
    setCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    try {
      await apiClient.createCategory(trimmed);
    } catch (e) {
      console.warn('Backend create category error:', e);
    }
  };

  // Product Management (Manager / Admin Only)
  const addNewProduct = async (productData) => {
    soundFx.playSuccessChime();
    const newId = Date.now();
    const formattedBarcode = productData.barcode?.trim() || '890' + Math.floor(1000000000 + Math.random() * 9000000000);
    const formattedSku = productData.sku?.trim() || 'SKU-' + Math.floor(1000 + Math.random() * 9000);

    const productObj = {
      id: newId,
      name: productData.name.trim(),
      brand: productData.brand?.trim() || 'Generic',
      pack: productData.pack?.trim() || (productData.unit ? `1 ${productData.unit}` : '1 pc'),
      price: parseFloat(productData.price) || 0,
      cost: parseFloat(productData.cost) || Math.round((parseFloat(productData.price) || 0) * 0.8),
      stock: parseInt(productData.stock) || 0,
      cat: productData.cat || 'General Grocery',
      barcode: formattedBarcode,
      sku: formattedSku,
      gstRate: parseFloat(productData.gstRate) || 0.05
    };

    // 1. Sync with Spring Boot backend
    try {
      await apiClient.createProduct({
        sku: productObj.sku,
        barcode: productObj.barcode,
        name: productObj.name,
        unit: productData.unit || 'pc',
        costPrice: productObj.cost,
        sellingPrice: productObj.price,
        gstPercent: productObj.gstRate * 100,
        minStock: 10,
        expiryTracking: false
      });
    } catch (e) {
      console.warn('Backend product sync fallback:', e);
    }

    setProducts((prev) => [productObj, ...prev]);
    showToast(`Product "${productObj.name}" added to catalog successfully!`, 'success');
    return productObj;
  };

  const deleteProduct = (prodId) => {
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
    showToast('Product removed from catalog', 'warning');
  };

  // GAP-06: Edit / Update Existing Product
  const updateProduct = async (id, updatedFields) => {
    soundFx.playSuccessChime();
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updatedFields };
        }
        return p;
      })
    );

    // Sync with Spring Boot backend
    try {
      await apiClient.updateProduct(id, {
        name: updatedFields.name,
        categoryId: updatedFields.categoryId || 1,
        unit: updatedFields.unit || (updatedFields.pack ? updatedFields.pack.replace(/^[0-9.]+\s*/, '') : 'pc') || 'pc',
        costPrice: updatedFields.cost !== undefined ? updatedFields.cost : 100,
        sellingPrice: updatedFields.price !== undefined ? updatedFields.price : 120,
        gstPercent: (updatedFields.gstRate || 0.05) * 100,
        minStock: updatedFields.minStock || 10,
        expiryTracking: false,
        active: true
      });
    } catch (e) {
      console.warn('Backend update product failed:', e);
    }

    showToast(`Product "${updatedFields.name || 'Catalog Item'}" updated successfully!`, 'success');
  };

  // Batch Stock Inward from Handwritten Slip / Parchi OCR
  const processHandwrittenStockInward = async (parsedItems) => {
    soundFx.playSuccessChime();
    let updatedCount = 0;
    let createdCount = 0;

    setProducts((prev) => {
      let currentProducts = [...prev];

      parsedItems.forEach((item) => {
        const qtyNum = parseInt(item.inwardQty) || 0;
        if (qtyNum <= 0) return;

        if (item.action === 'UPDATE_EXISTING' && item.matchedProductId) {
          // 1. Update existing product quantity
          currentProducts = currentProducts.map((p) => {
            if (p.id === item.matchedProductId) {
              updatedCount++;
              return { ...p, stock: p.stock + qtyNum };
            }
            return p;
          });
        } else if (item.action === 'ADD_NEW') {
          // 2. Add as new product to catalog
          createdCount++;
          const newId = Date.now() + Math.floor(Math.random() * 1000);
          const newProd = {
            id: newId,
            name: item.name.trim(),
            brand: item.brand?.trim() || 'Wholesale Supplier',
            pack: item.pack?.trim() || (item.unit ? `1 ${item.unit}` : '1 pc'),
            price: parseFloat(item.price) || 120,
            cost: parseFloat(item.cost) || Math.round((parseFloat(item.price) || 120) * 0.8),
            stock: qtyNum,
            cat: item.cat || 'General Grocery',
            barcode: item.barcode || '890' + Math.floor(1000000000 + Math.random() * 9000000000),
            sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
            gstRate: parseFloat(item.gstRate) || 0.05
          };
          currentProducts.unshift(newProd);

          // Backend sync
          apiClient.createProduct({
            sku: newProd.sku,
            barcode: newProd.barcode,
            name: newProd.name,
            unit: item.unit || 'pc',
            costPrice: newProd.cost,
            sellingPrice: newProd.price,
            gstPercent: newProd.gstRate * 100,
            minStock: 10,
            expiryTracking: false
          }).catch(() => {});
        }
      });

      return currentProducts;
    });

    showToast(`Handwritten Slip Processed: ${updatedCount} existing stocks updated, ${createdCount} new products added!`, 'success');
    return { updatedCount, createdCount };
  };

  // PO Actions
  const receivePO = (poId) => {
    soundFx.playSuccessChime();
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'RECEIVED' } : po))
    );
    showToast(`Goods Receipt Note (GRN) generated for ${poId}! Stock credited.`, 'success');
  };

  // GAP-09: Create New Supplier Purchase Order
  const createPurchaseOrder = async (poData) => {
    soundFx.playSuccessChime();
    const newPO = {
      id: 'PO-2026-' + Math.floor(100 + Math.random() * 900),
      vendor: poData.vendor.trim(),
      items: poData.items.trim(),
      amount: parseFloat(poData.amount) || 0,
      eta: poData.eta.trim() || 'Tomorrow 10:00 AM',
      status: 'IN TRANSIT',
      createdAt: new Date().toLocaleDateString('en-IN')
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);

    // Backend sync
    try {
      await apiClient.createPurchaseOrder({
        supplierId: poData.supplierId || 1,
        items: [
          {
            productId: 1,
            qty: 10,
            unitCost: newPO.amount
          }
        ]
      });
    } catch (e) {
      console.warn('Backend create PO fallback:', e);
    }

    showToast(`Purchase Order #${newPO.id} created for ${newPO.vendor}!`, 'success');
    return newPO;
  };

  // GAP-10: Register New Khata Customer
  const addKhataCustomer = async (custData) => {
    soundFx.playSuccessChime();
    const newCust = {
      id: Date.now(),
      name: custData.name.trim(),
      phone: custData.phone.trim(),
      address: custData.address.trim() || 'Local Customer',
      due: parseFloat(custData.initialDue) || 0,
      limit: parseFloat(custData.limit) || 5000,
      lastPay: custData.initialDue > 0 ? 'Opening Balance' : 'Never'
    };

    setKhataCustomers((prev) => [newCust, ...prev]);

    // Backend sync
    try {
      await apiClient.createCustomer({
        name: newCust.name,
        phone: newCust.phone,
        address: newCust.address,
        email: `${newCust.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@customer.local`,
        gstin: ''
      });
    } catch (e) {
      console.warn('Backend create customer fallback:', e);
    }

    showToast(`Khata Account registered for ${newCust.name}!`, 'success');
    return newCust;
  };

  // Staff & Cashier Management Actions (Manager Only)
  // GAP-04: Validate Duplicate Email and Handle Backend Errors
  const addCashier = async (newStaff) => {
    const email = newStaff.email.trim().toLowerCase();
    const username = newStaff.username.trim().toLowerCase();

    // 1. Check duplicate in local staffMembers first
    const exists = staffMembers.find((s) => s.email === email || s.username === username);
    if (exists) {
      showToast(`Yeh email ya username (${email}) pehle se registered hai!`, 'error');
      soundFx.playBarcodeBeep();
      return { success: false, error: 'Yeh email ya username pehle se registered hai!' };
    }

    // 2. Sync with Spring Boot backend
    try {
      const res = await apiClient.createCashierUser({
        name: newStaff.name.trim(),
        email: email,
        password: newStaff.password
      });

      if (res && res.error) {
        showToast(`Backend error: ${res.error}`, 'error');
        soundFx.playBarcodeBeep();
        return { success: false, error: res.error };
      }
    } catch (e) {
      console.warn('Backend staff sync fallback:', e);
    }

    soundFx.playSuccessChime();
    const cashierObj = {
      id: Date.now(),
      name: newStaff.name.trim(),
      username: username,
      email: email,
      password: newStaff.password,
      role: 'CASHIER',
      counter: newStaff.counter || 'Counter 1',
      active: true,
      createdAt: new Date().toLocaleDateString('en-IN')
    };

    setStaffMembers((prev) => [cashierObj, ...prev]);
    showToast(`New Cashier "${cashierObj.name}" created and assigned to ${cashierObj.counter}!`, 'success');
    return { success: true, cashier: cashierObj };
  };

  // GAP-05: Reset Cashier Password
  const resetCashierPassword = async (cashierId, newPassword) => {
    try {
      const res = await apiClient.resetStaffPassword(cashierId, newPassword);
      if (res && res.error) {
        showToast(`Password reset failed: ${res.error}`, 'error');
        return { success: false, error: res.error };
      }
    } catch (e) {
      console.warn('Backend reset password fallback:', e);
    }

    setStaffMembers((prev) =>
      prev.map((s) => (s.id === cashierId ? { ...s, password: newPassword } : s))
    );
    soundFx.playSuccessChime();
    showToast('Cashier password reset successfully!', 'success');
    return { success: true };
  };

  const toggleStaffStatus = (id) => {
    setStaffMembers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    showToast('Staff status updated', 'info');
  };

  const removeStaff = async (id) => {
    try {
      await apiClient.deactivateStaffUser(id);
    } catch {}
    setStaffMembers((prev) => prev.filter((s) => s.id !== id));
    showToast('Staff member removed', 'warning');
  };

  // Update Store Settings & Location (Persisted in localStorage and synced to Backend)
  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('sibms_store_settings', JSON.stringify(newSettings));
    } catch {}
    try {
      await apiClient.updateStoreDeliveryPolicy({
        minOrderValue: Number(newSettings.delivery?.minOrderValue ?? newSettings.minOrderValue) || 499,
        deliveryFee: Number(newSettings.delivery?.deliveryFee ?? newSettings.deliveryFee) || 30,
        maxRadiusKm: Number(newSettings.delivery?.maxRadiusKm ?? newSettings.deliveryRadiusKm) || 10.0,
        avgSlaMins: Number(newSettings.delivery?.avgSlaMins ?? newSettings.deliverySlaMins) || 35,
        storeName: newSettings.storeName || 'Apna Bazar Supermarket',
        address: newSettings.address || 'Plot 42, Sector 12 Main Market, Dwarka',
        latitude: newSettings.latitude ?? 28.5921,
        longitude: newSettings.longitude ?? 77.0460
      });
    } catch (e) {
      console.warn('Backend update store delivery policy failed:', e);
    }
    showToast('Store Location & Configuration saved successfully!', 'success');
  };

  return (
    <StoreContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor,
        changeAccentColor,
        audioEnabled,
        toggleAudio,
        isDeliveryActive,
        toggleDeliveryActive,
        backendOnline,
        products,
        cart,
        addToCart,
        changeCartQty,
        removeFromCart,
        clearCart,
        selectedCustomer,
        setSelectedCustomer,
        discount,
        setDiscount,
        paymentMode,
        setPaymentMode,
        getCartTotals,
        completeInvoice,
        heldBills,
        parkCurrentBill,
        resumeBill,
        discardHeldBill,
        inwardOrders,
        updateOrderStatus,
        clearAllInwardOrders,
        checkIncomingOrders,
        khataCustomers,
        recordKhataPayment,
        addKhataCustomer,
        adjustStock,
        categories,
        addCategory,
        refreshProducts,
        isLoadingProducts,
        addNewProduct,
        updateProduct,
        deleteProduct,
        processHandwrittenStockInward,
        purchaseOrders,
        receivePO,
        createPurchaseOrder,
        staffMembers,
        addCashier,
        resetCashierPassword,
        toggleStaffStatus,
        removeStaff,
        settings,
        updateSettings,
        todayStats,
        toasts,
        showToast,
        activeReceipt,
        setActiveReceipt,
        activeParchiOrder,
        setActiveParchiOrder
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};