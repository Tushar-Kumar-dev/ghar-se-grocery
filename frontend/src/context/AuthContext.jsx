import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext(null);

export const ROLE_PERMISSIONS = {
  ROLE_MANAGER: ['ALL', 'POS_BILLING', 'ORDERS_MANAGE', 'INVENTORY_ADJUST', 'KHATA_MANAGE', 'PO_MANAGE', 'SETTINGS_MANAGE', 'DELIVERY_TOGGLE'],
  ROLE_CASHIER: ['POS_BILLING', 'ORDERS_MANAGE', 'KHATA_VIEW'],
  ROLE_CUSTOMER: ['CUSTOMER_ORDERING']
};

export const DEMO_USERS = {
  manager: {
    id: 1,
    username: 'manager',
    fullName: 'Rajesh Kumar',
    email: 'manager@sibms.com',
    role: 'ROLE_MANAGER',
    roleLabel: 'Store Manager',
    permissions: ROLE_PERMISSIONS.ROLE_MANAGER
  }
};

export const AuthProvider = ({ children }) => {
  // If not previously saved, default to null so user MUST authenticate first!
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sibms_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sibms_auth_token') || null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sibms_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sibms_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sibms_auth_token', token);
    } else {
      localStorage.removeItem('sibms_auth_token');
    }
  }, [token]);

  // Login handler
  const login = async (username, password) => {
    const cleanUser = (username || '').trim().toLowerCase();

    // 1. Try real Spring Boot backend API
    try {
      const data = await apiClient.login(cleanUser, password);
      if (data && !data.error) {
        const rawRole = String(data.user?.role || data.role || '').toUpperCase();
        const role = rawRole.includes('CUSTOMER') || cleanUser.includes('customer')
          ? 'ROLE_CUSTOMER'
          : rawRole.includes('CASHIER') || cleanUser.includes('cashier')
          ? 'ROLE_CASHIER'
          : 'ROLE_MANAGER';

        const userObj = {
          id: data.user?.id || Date.now(),
          username: data.user?.name || cleanUser,
          fullName: data.user?.name || (role === 'ROLE_CUSTOMER' ? 'Sunita Sharma' : role === 'ROLE_CASHIER' ? 'Amit Sharma' : 'Rajesh Kumar'),
          email: data.user?.email || (cleanUser.includes('@') ? cleanUser : `${cleanUser}@sibms.com`),
          role: role,
          roleLabel: role === 'ROLE_CUSTOMER' ? 'Customer / Consumer' : role === 'ROLE_CASHIER' ? 'Cashier / Associate' : 'Store Manager',
          permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.ROLE_MANAGER
        };

        const jwtToken = data.accessToken || 'jwt_session_' + Date.now();
        setCurrentUser(userObj);
        setToken(jwtToken);
        setIsLoginModalOpen(false);
        return { success: true, user: userObj };
      }
    } catch (e) {
      console.warn('Backend login attempt error, testing local demo credentials:', e);
    }

    // 2. Sole Manager fallback credentials matching
    if (cleanUser === 'manager' || cleanUser.includes('manager') || cleanUser === 'admin' || cleanUser === 'manager@sibms.com') {
      if (password === 'admin123' || password === 'Admin@123' || !password) {
        const u = DEMO_USERS.manager;
        setCurrentUser(u);
        setToken('mock_jwt_manager_' + Date.now());
        setIsLoginModalOpen(false);
        return { success: true, user: u };
      }
    }

    // Check localStorage registered accounts (if user signed up in this browser)
    try {
      const registeredAccounts = JSON.parse(localStorage.getItem('sibms_registered_accounts') || '[]');
      const matched = registeredAccounts.find(
        (acc) => (acc.email.toLowerCase() === cleanUser || acc.username.toLowerCase() === cleanUser) && acc.password === password
      );
      if (matched) {
        setCurrentUser(matched.user);
        setToken('jwt_registered_' + Date.now());
        setIsLoginModalOpen(false);
        return { success: true, user: matched.user };
      }
    } catch {}

    // Check staff members created by Store Manager
    try {
      const staffList = JSON.parse(localStorage.getItem('sibms_staff_members') || '[]');
      const matchedStaff = staffList.find(
        (s) =>
          (s.username?.toLowerCase() === cleanUser || s.email?.toLowerCase() === cleanUser) &&
          (s.password === password || password === 'cashier123')
      );
      if (matchedStaff) {
        if (matchedStaff.active === false) {
          return { success: false, error: 'This cashier account has been deactivated by the Store Manager.' };
        }
        const u = {
          id: matchedStaff.id,
          username: matchedStaff.username,
          fullName: matchedStaff.name,
          email: matchedStaff.email,
          role: 'ROLE_CASHIER',
          roleLabel: `Cashier (${matchedStaff.counter || 'POS Counter'})`,
          permissions: DEMO_USERS.cashier.permissions
        };
        setCurrentUser(u);
        setToken('jwt_staff_' + Date.now());
        setIsLoginModalOpen(false);
        return { success: true, user: u };
      }
    } catch {}

    return { success: false, error: 'Invalid username/email or password' };
  };

  // Sign up handler
  const register = async ({ name, email, password, role, phone, address }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = (role || 'CUSTOMER').toUpperCase(); // CUSTOMER, CASHIER, MANAGER

    // 1. Try real Spring Boot backend registration
    try {
      const data = await apiClient.register({
        name: name.trim(),
        email: cleanEmail,
        password: password,
        role: cleanRole
      });

      if (data && !data.error) {
        const assignedRole = cleanRole === 'CUSTOMER' ? 'ROLE_CUSTOMER' : cleanRole === 'CASHIER' ? 'ROLE_CASHIER' : 'ROLE_MANAGER';
        const userObj = {
          id: data.user?.id || Date.now(),
          username: cleanEmail.split('@')[0],
          fullName: name.trim(),
          email: cleanEmail,
          phone: phone || '',
          address: address || '',
          role: assignedRole,
          roleLabel: assignedRole === 'ROLE_CUSTOMER' ? 'Customer / Consumer' : assignedRole === 'ROLE_CASHIER' ? 'Cashier / Associate' : 'Store Manager',
          permissions: ROLE_PERMISSIONS[assignedRole] || ROLE_PERMISSIONS.ROLE_CUSTOMER
        };

        const jwtToken = data.accessToken || 'jwt_session_' + Date.now();
        setCurrentUser(userObj);
        setToken(jwtToken);
        setIsLoginModalOpen(false);
        return { success: true, user: userObj };
      } else if (data?.error) {
        return { success: false, error: data.error };
      }
    } catch (e) {
      console.warn('Backend register error, creating local registered account:', e);
    }

    // 2. Local Demo fallback
    const assignedRole = cleanRole === 'CUSTOMER' ? 'ROLE_CUSTOMER' : cleanRole === 'CASHIER' ? 'ROLE_CASHIER' : 'ROLE_MANAGER';
    const userObj = {
      id: Date.now(),
      username: cleanEmail.split('@')[0],
      fullName: name.trim(),
      email: cleanEmail,
      phone: phone || '',
      address: address || '',
      role: assignedRole,
      roleLabel: assignedRole === 'ROLE_CUSTOMER' ? 'Customer / Consumer' : assignedRole === 'ROLE_CASHIER' ? 'Cashier / Associate' : 'Store Manager',
      permissions: ROLE_PERMISSIONS[assignedRole] || ROLE_PERMISSIONS.ROLE_CUSTOMER
    };

    // Save to local registered accounts cache
    try {
      const accounts = JSON.parse(localStorage.getItem('sibms_registered_accounts') || '[]');
      accounts.push({ email: cleanEmail, username: userObj.username, password, user: userObj });
      localStorage.setItem('sibms_registered_accounts', JSON.stringify(accounts));
    } catch {}

    setCurrentUser(userObj);
    setToken('jwt_registered_' + Date.now());
    setIsLoginModalOpen(false);
    return { success: true, user: userObj };
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('sibms_auth_user');
    localStorage.removeItem('sibms_auth_token');
  };

  // Quick Switch for testing
  const quickSwitch = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      const u = DEMO_USERS[roleKey];
      setCurrentUser(u);
      setToken('mock_jwt_' + roleKey + '_' + Date.now());
      setIsLoginModalOpen(false);
    }
  };

  // Authorization Helpers
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.permissions?.includes('ALL')) return true;
    return currentUser.permissions?.includes(permission);
  };

  const isManager = currentUser?.role === 'ROLE_MANAGER' || currentUser?.role === 'ROLE_ADMIN';
  const isCashier = currentUser?.role === 'ROLE_CASHIER';
  const isCustomer = currentUser?.role === 'ROLE_CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: Boolean(currentUser && token),
        isLoginModalOpen,
        setIsLoginModalOpen,
        login,
        register,
        logout,
        quickSwitch,
        hasPermission,
        isManager,
        isCashier,
        isCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
