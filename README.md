# SIBMS Store Admin & POS Web Application (React + Vite)

Modern, ultra-responsive Store Manager, Billing Counter, and Inward Orders Hub built with **React 18**, **Vite**, **Tailwind CSS**, and **Web Audio API**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🌟 Key Features

1. **POS Billing Register (F2)**:
   - High-speed product catalog with categories (Flours, Oils, Dairy, Beverages, Snacks, Personal Care).
   - Barcode Scanner Gun simulation with authentic **880Hz audio tone**.
   - Customer Khata lookup with previous balance due alerts.
   - Live tax calculations (CGST 2.5% + SGST 2.5%), flat discount, and grand total.
   - **Authentic 80mm Thermal Receipt**: Perforated paper cuts, store GSTIN, itemized break-up, UPI QR code, and browser print (`Ctrl+P`).

2. **Inward Online Orders Hub (F4)**:
   - Real-time synchronization with customer ordering portal.
   - Support for **Handwritten Grocery Parchi Photo Inspection** with high-res magnifier.
   - 4-Step Live Order Pipeline: `Received` ➔ `Packing` ➔ `Dispatched / Counter Ready` ➔ `Completed`.
   - Direct status sync back to customer app!

3. **Master Store Home Delivery Switch**:
   - Hardware-style toggle in Top Bar and Settings:
     - `[GREEN LED] Home Delivery ACTIVE`
     - `[AMBER LED] Home Delivery PAUSED (Counter Pickup Only)`
   - Instant cross-tab broadcast that tells the customer app whether this store is delivering.

4. **Inventory & Real-Time Stock Ledger (F10)**:
   - Live stock catalog, threshold badges, low stock warnings (&le; 10 units).
   - Stock inward / damage adjustment modal.

5. **Customer Khata (Digital Udhaar Bahi-Khata) (F8)**:
   - Track credit accounts, record payments received with instant balance deduction, and send simulated WhatsApp reminders.

6. **Purchase Orders (F9)**:
   - Wholesale orders from FMCG vendors (ITC, Adani Wilmar, Amul) with Goods Receipt Note (GRN) verification.

7. **Store Delivery Policy Settings**:
   - Configure minimum order value for free delivery, fee for small orders, radius, and SLA.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| **F2** | Open POS Billing Counter |
| **F4** | Open Inward Online Orders Hub |
| **F8** | Open Customer Khata (Udhaar) |
| **F9** | Open Purchase Orders & Suppliers |
| **F10** | Open Inventory & Stock Ledger |
| **Ctrl + P** | Print 80mm Thermal POS Receipt |
