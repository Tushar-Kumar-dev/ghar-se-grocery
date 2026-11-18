/**
 * locationService.js
 * ------------------------------------------------------------
 * Ye service user aur grocery store ki location (GPS coordinates)
 * aur distance calculate karne ke liye use hoti hai.
 * 
 * Features:
 * 1. Haversine Formula: Do coordinates ke beech ka aerial distance (KM) calculate karna.
 * 2. 10 KM Radius Check: Dukan 10 km ke daayre me hai ya bahar, filter karna.
 * 3. Browser GPS Geolocation: User ya Manager ki real-time location fetch karna.
 * ------------------------------------------------------------
 */

// Dharti (Earth) ka average radius kilometers me
const EARTH_RADIUS_KM = 6371;

/**
 * Simple helper: Degrees ko Radians me badalta hai (Math formulas ke liye zaroori)
 */
const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Haversine Formula:
 * User ke (lat1, lon1) aur Store ke (lat2, lon2) ke beech ka aerial distance KM me nikalta hai.
 * 
 * @param {number} lat1 - User Latitude
 * @param {number} lon1 - User Longitude
 * @param {number} lat2 - Store Latitude
 * @param {number} lon2 - Store Longitude
 * @returns {number} Distance in Kilometers (e.g. 2.4)
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined || lat1 === null ||
    lon1 === undefined || lon1 === null ||
    lat2 === undefined || lat2 === null ||
    lon2 === undefined || lon2 === null
  ) {
    return 0;
  }

  const userLat = parseFloat(lat1);
  const userLon = parseFloat(lon1);
  const storeLat = parseFloat(lat2);
  const storeLon = parseFloat(lon2);

  if (isNaN(userLat) || isNaN(userLon) || isNaN(storeLat) || isNaN(storeLon)) {
    return 0;
  }

  // Latitudes aur Longitudes ka difference (radians me)
  const dLat = toRadians(storeLat - userLat);
  const dLon = toRadians(storeLon - userLon);

  // Haversine formula calculation
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(userLat)) *
      Math.cos(toRadians(storeLat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  // 1 decimal place tak round karte hain (jaise 2.4 km)
  return Math.round(distance * 10) / 10;
};

/**
 * Browser ke native GPS se user ya manager ki live location fetch karta hai.
 */
export const getCurrentGpsLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Aapke browser me GPS / Geolocation support nahi hai.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
          longitude: parseFloat(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy)
        });
      },
      (error) => {
        let msg = 'Location detect nahi ho saki.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission block hai. Kripya browser me location allow karein.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information abhi available nahi hai.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request time out ho gayi.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

/**
 * Sample Kirana Stores List:
 * Isme Store Manager ki dukan + aas-paas ki kirana stores hain.
 * Manager jab apni location badalega, toh unka store live update hoga.
 */
export const getNearbyKiranaStoresList = (managerSettings) => {
  // Store Manager ki saved details (Default: Dwarka Sector 12)
  const managerLat = managerSettings?.latitude ?? 28.5921;
  const managerLon = managerSettings?.longitude ?? 77.0460;
  const managerStoreName = managerSettings?.storeName || 'Apna Bazar Supermarket';
  const managerAddress = managerSettings?.address || 'Plot 42, Sector 12 Main Market, Dwarka';
  const managerPhone = managerSettings?.phone || '+91 95285 90856';

  return [
    {
      id: 1,
      name: managerStoreName,
      code: 'DEL-8821',
      address: managerAddress,
      area: managerAddress,
      latitude: managerLat,
      longitude: managerLon,
      phone: managerPhone,
      deliveryAvailable: managerSettings?.delivery?.enabled ?? true,
      minOrder: managerSettings?.delivery?.minOrderValue ?? 499,
      deliveryFee: managerSettings?.delivery?.deliveryFee ?? 30,
      fee: managerSettings?.delivery?.deliveryFee ?? 30,
      avgSlaMins: managerSettings?.delivery?.avgSlaMins ?? 30,
      sla: managerSettings?.delivery?.avgSlaMins ?? 30,
      rating: 4.9,
      tag: 'Featured Supermarket',
      isMainStore: true
    },
    {
      id: 2,
      name: 'Gupta Kirana & General Store',
      code: 'DEL-8819',
      address: 'Pocket 3, Sector 12 Market, Dwarka',
      area: 'Pocket 3, Sector 12, Dwarka',
      latitude: 28.6015,
      longitude: 77.0530,
      phone: '+91 98111 22334',
      deliveryAvailable: true,
      minOrder: 300,
      deliveryFee: 20,
      fee: 20,
      avgSlaMins: 25,
      sla: 25,
      rating: 4.7,
      tag: 'Verified Partner Store',
      isMainStore: false
    },
    {
      id: 3,
      name: 'Aggarwal Provisions & Spices',
      code: 'DEL-8830',
      address: 'Ramphal Chowk, Sector 7, Dwarka',
      area: 'Sector 7, Dwarka',
      latitude: 28.5830,
      longitude: 77.0680,
      phone: '+91 98222 33445',
      deliveryAvailable: true,
      minOrder: 350,
      deliveryFee: 25,
      fee: 25,
      avgSlaMins: 35,
      sla: 35,
      rating: 4.6,
      tag: 'Verified Partner Store',
      isMainStore: false
    },
    {
      id: 4,
      name: 'Sharma Daily Needs Kirana',
      code: 'DEL-8845',
      address: 'Block B, Janakpuri East (Near Metro Station)',
      area: 'Janakpuri East, Delhi',
      latitude: 28.6295,
      longitude: 77.0865,
      phone: '+91 98333 44556',
      deliveryAvailable: false, // Counter Pickup Only
      minOrder: 200,
      deliveryFee: 0,
      fee: 0,
      avgSlaMins: 45,
      sla: 45,
      rating: 4.4,
      tag: 'Counter Pickup Only',
      isMainStore: false
    },
    {
      id: 5,
      name: 'Metro Hyper Supermarket',
      code: 'DEL-9901',
      address: 'NH-48, Mahipalpur Highway, New Delhi',
      area: 'Mahipalpur Highway',
      latitude: 28.5350,
      longitude: 77.1250,
      phone: '+91 98777 88990',
      deliveryAvailable: true,
      minOrder: 1500,
      deliveryFee: 120,
      fee: 120,
      avgSlaMins: 90,
      sla: 90,
      rating: 4.2,
      tag: 'Wholesale Depot',
      isMainStore: false
    }
  ];
};

/**
 * 10 KM Radius Filter:
 * User ke lat/lon ke hisaab se har store ki distance calculate karta hai,
 * aur check karta hai ki store 10 KM ke daayre me hai ya bahar.
 * 
 * @param {Array} stores - Stores ki list
 * @param {number} userLat - User Latitude
 * @param {number} userLon - User Longitude
 * @param {number} maxRadiusKm - Maximum range (Default: 10 KM)
 * @returns {Array} Processed & Sorted Stores List (Nearest store sabse pehle)
 */
export const calculateStoresWithinRange = (stores, userLat, userLon, maxRadiusKm = 10.0) => {
  return stores
    .map((store) => {
      const distance = calculateDistanceKm(userLat, userLon, store.latitude, store.longitude);
      const isWithin10Km = distance <= maxRadiusKm;

      return {
        ...store,
        distanceKm: distance,
        distanceText: `${distance} km`,
        isWithin10Km: isWithin10Km
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm); // Nazdeek wali dukaan pehle aayegi
};
