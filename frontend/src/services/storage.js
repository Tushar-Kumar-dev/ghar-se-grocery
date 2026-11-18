// LocalStorage & Cross-Window Broadcast Synchronization Service

const SYNC_CHANNEL_NAME = 'sibms_sync';
let broadcastChannel = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported in this environment', e);
  }
}

export const StorageService = {
  // Delivery Toggle State
  getDeliveryState: () => {
    try {
      const data = localStorage.getItem('sibms_store_delivery_active');
      if (data !== null) {
        try {
          const parsed = JSON.parse(data);
          return parsed.active !== false;
        } catch {
          return data !== 'false';
        }
      }
    } catch (e) {}
    return true; // Default ON
  },

  setDeliveryState: (active, storeName = 'Apna Bazar Supermarket') => {
    try {
      const payload = {
        active,
        storeName,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('sibms_store_delivery_active', JSON.stringify(payload));
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'DELIVERY_TOGGLED', payload });
      }
    } catch (e) {}
  },

  // Inward Orders
  getLatestCustomerOrder: () => {
    try {
      const data = localStorage.getItem('sibms_latest_customer_order');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return null;
  },

  updateCustomerOrder: (order) => {
    try {
      localStorage.setItem('sibms_latest_customer_order', JSON.stringify(order));

      // Also sync into multi-order customer history
      try {
        const history = JSON.parse(localStorage.getItem('sibms_customer_order_history') || '[]');
        const idx = history.findIndex((o) => o.orderId === order.orderId);
        if (idx >= 0) {
          history[idx] = { ...history[idx], ...order };
        } else {
          history.unshift(order);
        }
        localStorage.setItem('sibms_customer_order_history', JSON.stringify(history.slice(0, 30)));
      } catch (err) {}

      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'ORDER_STATUS_CHANGED', payload: order });
      }
    } catch (e) {}
  },

  getCustomerOrderHistory: () => {
    try {
      const data = localStorage.getItem('sibms_customer_order_history');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return [];
  },

  // Broadcast Listener
  subscribeToBroadcast: (callback) => {
    if (broadcastChannel) {
      const handler = (event) => callback(event.data);
      broadcastChannel.addEventListener('message', handler);
      return () => broadcastChannel.removeEventListener('message', handler);
    }
    return () => {};
  }
};