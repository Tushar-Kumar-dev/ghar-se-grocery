/**
 * WhatsApp Messaging & Notification Service for Apna Bazar Grocery List Workflow
 * Generates step-by-step notification templates and deep links (wa.me) for instant WhatsApp delivery.
 */

export const cleanPhoneNumber = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  // If already 12 digits starting with 91, return as is
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  // If 10 digits (standard Indian mobile), prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
};

export const NOTIFICATION_TEMPLATES = {
  RECEIVED: (order) => 
`Namaste ${order.customerName || 'Customer'}! 🛒
Aapki grocery list Apna Bazar Supermarket ko receive ho gayi hai (Order #${order.orderId}).
Hum ise review kar rahe hain aur jald hi packing start karenge!

Store: ${order.storeName || 'Apna Bazar Supermarket'}
Fulfillment: ${order.fulfillmentMode === 'delivery' ? 'Home Delivery 🛵' : 'Store Counter Pickup 🛍️'}`,

  PACKING: (order) => 
`Namaste ${order.customerName || 'Customer'}! 📦
Good news! Aapki grocery list (Order #${order.orderId}) store ne ACCEPT kar li hai.
Humne aapke items pack karna shuru kar diya hai!

Estimated Bill: ₹${order.estimatedTotal || 0}
Store: ${order.storeName || 'Apna Bazar Supermarket'}`,

  OUT_FOR_DELIVERY: (order) => 
`Namaste ${order.customerName || 'Customer'}! 🛵
Aapka grocery order #${order.orderId} store se DISPATCH ho gaya hai aur aapke raste mein hai!

Delivery Partner: ${order.riderName || 'Store Express Rider'} (${order.riderPhone || 'Contact Store'})
Total Payable: ₹${order.estimatedTotal || 0} (Pay on Delivery - Cash/Direct UPI)`,

  READY_FOR_PICKUP: (order) => 
`Namaste ${order.customerName || 'Customer'}! 🛍️
Aapka grocery order #${order.orderId} pack ho chuka hai aur counter par ready hai!

Aap Counter #1 (${order.storeName || 'Apna Bazar Supermarket'}) par aakar apna order collect kar sakte hain.
Total Bill: ₹${order.estimatedTotal || 0}`,

  COMPLETED: (order) => 
`Namaste ${order.customerName || 'Customer'}! 🎉
Aapka grocery order #${order.orderId} successfully deliver/complete ho gaya hai!

Apna Bazar se shopping karne ke liye bahut-bahut shukriya! Agli baar bhi apni grocery list zaroor bhejein! 🙏`,

  CANCELLED: (order) => 
`Namaste ${order.customerName || 'Customer'},
Aapka grocery order #${order.orderId} cancel kar diya gaya hai.
Karan: ${order.cancelReason || 'Requested items currently unavailable'}

Kisi bhi sahayata ke liye store se contact karein. Asuvidha ke liye khed hai.`
};

export const WhatsAppService = {
  /**
   * Generates wa.me URL for the order at given status step
   */
  generateWhatsAppUrl: (order, step) => {
    const phone = cleanPhoneNumber(order.customerPhone);
    const templateFn = NOTIFICATION_TEMPLATES[step] || NOTIFICATION_TEMPLATES.PACKING;
    const message = templateFn(order);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Get formatted notification message text
   */
  getMessageText: (order, step) => {
    const templateFn = NOTIFICATION_TEMPLATES[step] || NOTIFICATION_TEMPLATES.PACKING;
    return templateFn(order);
  },

  /**
   * Trigger WhatsApp Web / App directly in a new window
   */
  sendWhatsAppNotification: (order, step) => {
    const url = WhatsAppService.generateWhatsAppUrl(order, step);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return url;
  }
};
