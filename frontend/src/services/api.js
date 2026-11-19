// API Client for Spring Boot Backend (Uses VITE_API_URL or defaults to live Render backend in production)
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ghar-se-grocery.onrender.com/api' : '/api');

const getAuthHeaders = () => {
  const token = localStorage.getItem('sibms_auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiClient = {
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/store-delivery/status`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth: Login with Spring Boot Backend
  login: async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({}));
      return { error: err.message || 'Invalid username or password' };
    } catch (e) {
      console.warn('Backend login unavailable:', e);
      return { error: 'Network error or backend unreachable' };
    }
  },

  // Auth: Register with Spring Boot Backend
  register: async ({ name, email, password, role }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({}));
      return { error: err.message || 'Registration failed' };
    } catch (e) {
      console.warn('Backend register unavailable:', e);
      return { error: 'Network error or backend unreachable' };
    }
  },

  // Store Delivery Policy & Toggle
  getStoreDeliveryStatus: async () => {
    try {
      const res = await fetch(`${API_BASE}/store-delivery/status`);
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend store delivery status fetch failed:', e);
    }
    return null;
  },

  toggleStoreDelivery: async (active) => {
    try {
      const res = await fetch(`${API_BASE}/store-delivery/toggle`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ active })
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend toggle delivery failed:', e);
    }
    return null;
  },

  updateStoreDeliveryPolicy: async (policyData) => {
    try {
      const res = await fetch(`${API_BASE}/store-delivery/policy`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(policyData)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend update store delivery policy failed:', e);
    }
    return null;
  },

  // Customer Inward Orders (Parchi & Grocery Lists)
  getCustomerOrders: async () => {
    try {
      const res = await fetch(`${API_BASE}/customer-orders`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend customer orders fetch failed:', e);
    }
    return null;
  },

  getCustomerOrderByNumber: async (orderNumber) => {
    try {
      const res = await fetch(`${API_BASE}/customer-orders/${encodeURIComponent(orderNumber)}`);
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend fetch order by number failed:', e);
    }
    return null;
  },

  createCustomerOrder: async (orderPayload) => {
    try {
      const payload = {
        orderNumber: orderPayload.orderId || orderPayload.orderNumber,
        storeName: orderPayload.storeName || 'Apna Bazar Supermarket',
        customerName: orderPayload.customerName,
        customerPhone: orderPayload.customerPhone,
        fulfillmentMode: orderPayload.fulfillmentMode,
        deliveryAddress: orderPayload.address || orderPayload.deliveryAddress || 'Store Pickup',
        listType: orderPayload.listType,
        parchiImageUrl: orderPayload.parchiImg || orderPayload.parchiImageUrl || null,
        itemsSummary: orderPayload.itemsSummary,
        itemsJson: orderPayload.itemsList ? JSON.stringify(orderPayload.itemsList) : null,
        estimatedTotal: orderPayload.estimatedTotal || 0
      };

      const res = await fetch(`${API_BASE}/customer-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend create customer order failed:', e);
    }
    return null;
  },

  updateCustomerOrderStatus: async (orderNumber, status, note = '') => {
    try {
      const res = await fetch(`${API_BASE}/customer-orders/${encodeURIComponent(orderNumber)}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, note })
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend update customer order status failed:', e);
    }
    return null;
  },

  // Products
  getProducts: async () => {
    try {
      let res = await fetch(`${API_BASE}/products/all`);
      if (!res.ok) {
        res = await fetch(`${API_BASE}/products?size=200`);
      }
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (json?.content ?? json?.data ?? []);
        return rawList.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand || 'Generic',
          pack: p.pack || (p.unit ? `1 ${p.unit}` : '1 pc'),
          price: p.price !== undefined ? Number(p.price) : (p.sellingPrice ? Number(p.sellingPrice) : 0),
          cost: p.cost !== undefined ? Number(p.cost) : (p.costPrice ? Number(p.costPrice) : 0),
          stock: p.stock !== undefined ? Number(p.stock) : 0,
          cat: p.cat || p.categoryName || 'General Grocery',
          barcode: p.barcode || '',
          sku: p.sku || '',
          gstRate: p.gstRate !== undefined ? Number(p.gstRate) : (p.gstPercent ? Number(p.gstPercent) / 100 : 0.05),
          unit: p.unit || 'pc'
        }));
      }
    } catch (e) {
      console.warn('Backend get products failed:', e);
    }
    return null;
  },

  // Categories
  getCategories: async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : (json?.content ?? json?.data ?? []);
        return list.map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean);
      }
    } catch (e) {
      console.warn('Backend get categories failed:', e);
    }
    return [];
  },

  createCategory: async (categoryName) => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: categoryName })
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend create category failed:', e);
    }
    return null;
  },

  createProduct: async (productData) => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend create product failed:', e);
    }
    return null;
  },

  updateProduct: async (id, productData) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend update product failed:', e);
    }
    return null;
  },

  // Invoices & Billing
  createInvoice: async (invoicePayload) => {
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(invoicePayload)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend create invoice failed:', e);
    }
    return null;
  },

  // Customers (Khata)
  getCustomers: async () => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json?.content ?? json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend get customers failed:', e);
    }
    return null;
  },

  createCustomer: async (customerData) => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(customerData)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend create customer failed:', e);
    }
    return null;
  },

  // Purchase Orders
  getPurchaseOrders: async () => {
    try {
      const res = await fetch(`${API_BASE}/purchase-orders`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json?.content ?? json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend get purchase orders failed:', e);
    }
    return null;
  },

  createPurchaseOrder: async (poData) => {
    try {
      const res = await fetch(`${API_BASE}/purchase-orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(poData)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend create purchase order failed:', e);
    }
    return null;
  },

  // Dashboard Stats
  getDashboardSummary: async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend get dashboard summary failed:', e);
    }
    return null;
  },

  // Staff & Cashier Management (Manager Only)
  getStaffUsers: async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json?.content ?? json?.data ?? json;
      }
    } catch (e) {
      console.warn('Backend get staff users failed:', e);
    }
    return null;
  },

  createCashierUser: async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role: 'CASHIER'
        })
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({}));
      return { error: err.message || 'Failed to create cashier account' };
    } catch (e) {
      console.warn('Backend create cashier failed:', e);
      return { error: 'Network error or backend unreachable' };
    }
  },

  deactivateStaffUser: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch (e) {
      console.warn('Backend deactivate staff failed:', e);
      return false;
    }
  },

  resetStaffPassword: async (id, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}/reset-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newPassword })
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({}));
      return { error: err.message || 'Failed to reset cashier password' };
    } catch (e) {
      console.warn('Backend reset password failed:', e);
      return { error: 'Network error or backend unreachable' };
    }
  }
};
