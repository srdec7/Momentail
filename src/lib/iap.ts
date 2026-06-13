import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// ─── REVENUECAT CONFIGURATION ────────────────────────────────────────────────
// TODO (Macbook Colleague): Replace these with your actual RevenueCat API keys
const REVENUECAT_APPLE_API_KEY = "appl_YOUR_APPLE_API_KEY_HERE";
const REVENUECAT_GOOGLE_API_KEY = "goog_YOUR_GOOGLE_API_KEY_HERE";

// TODO (Macbook Colleague): Replace with your exact Entitlement ID in RevenueCat
export const ENTITLEMENT_ID = "pro"; 
// ─────────────────────────────────────────────────────────────────────────────

export async function initializeIAP() {
  if (Capacitor.getPlatform() === 'web') {
    console.log('RevenueCat is not supported on web. Using mock IAP.');
    return;
  }

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    
    if (Capacitor.getPlatform() === 'ios') {
      await Purchases.configure({ apiKey: REVENUECAT_APPLE_API_KEY });
    } else if (Capacitor.getPlatform() === 'android') {
      await Purchases.configure({ apiKey: REVENUECAT_GOOGLE_API_KEY });
    }
    
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (Capacitor.getPlatform() === 'web') {
    return localStorage.getItem('petory_premium') === 'true';
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

export async function getProPrice(): Promise<string | null> {
  if (Capacitor.getPlatform() === 'web') {
    return "$3.99"; // Mock price for web
  }

  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      // Takes the first package in the current offering (usually Lifetime)
      const lifetimePackage = offerings.current.availablePackages[0];
      return lifetimePackage.product.priceString;
    }
  } catch (error) {
    console.error('Error fetching offerings:', error);
  }
  return null;
}

export async function purchasePro(): Promise<boolean> {
  if (Capacitor.getPlatform() === 'web') {
    // Mock purchase for web
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('petory_premium', 'true');
        resolve(true);
      }, 1500);
    });
  }

  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      const packageToBuy = offerings.current.availablePackages[0];
      const purchaseResult = await Purchases.purchasePackage({ aPackage: packageToBuy });
      
      if (typeof purchaseResult.customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
        return true;
      }
    } else {
      throw new Error("No packages available for purchase. Please check RevenueCat Offerings.");
    }
  } catch (error: any) {
    if (error.code === 'PURCHASE_CANCELLED' || error.message.includes('cancel')) {
      console.log('User cancelled purchase');
      return false;
    }
    console.error('Error purchasing:', error);
    throw error;
  }
  return false;
}

export async function restorePurchases(): Promise<boolean> {
  if (Capacitor.getPlatform() === 'web') {
    return localStorage.getItem('petory_premium') === 'true';
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}
