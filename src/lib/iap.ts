import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

const REVENUECAT_APPLE_API_KEY = 'appl_SpbHTttYprfikGKMPUOATowPVdD';
const REVENUECAT_GOOGLE_API_KEY = 'goog_YOUR_GOOGLE_API_KEY_HERE';

export const ENTITLEMENT_ID = 'pro';
export const PRODUCT_ID = 'com.momentail.petory.premium';
export const APPLE_APP_ID = '6781349460';

let _configured = false;

function isWeb() {
  return Capacitor.getPlatform() === 'web';
}

function getCachedPremium() {
  return localStorage.getItem('petory_premium') === 'true';
}

function setCachedPremium(value: boolean) {
  if (value) localStorage.setItem('petory_premium', 'true');
  else localStorage.removeItem('petory_premium');
}

function unwrapCustomerInfo(result: any) {
  return result?.customerInfo ?? result;
}

function hasPremiumAccess(customerInfo: any): boolean {
  if (!customerInfo) return false;

  const activeEntitlements = customerInfo.entitlements?.active ?? {};
  if (typeof activeEntitlements[ENTITLEMENT_ID] !== 'undefined') return true;

  const purchasedProducts: string[] = customerInfo.allPurchasedProductIdentifiers ?? [];
  return purchasedProducts.includes(PRODUCT_ID);
}

function isCancelled(error: any) {
  const code = String(error?.code ?? '').toUpperCase();
  const message = String(error?.message ?? '').toLowerCase();
  return code.includes('CANCEL') || message.includes('cancel');
}

function isAlreadyPurchased(error: any) {
  const code = String(error?.code ?? '').toUpperCase();
  const message = String(error?.message ?? '').toLowerCase();
  return code.includes('ALREADY') || message.includes('already') || message.includes('owned');
}

export async function initializeIAP() {
  if (isWeb()) {
    console.log('RevenueCat is not supported on web. Using mock IAP.');
    return;
  }
  if (_configured) return;

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

    if (Capacitor.getPlatform() === 'ios') {
      await Purchases.configure({ apiKey: REVENUECAT_APPLE_API_KEY });
    } else if (Capacitor.getPlatform() === 'android') {
      await Purchases.configure({ apiKey: REVENUECAT_GOOGLE_API_KEY });
    }

    _configured = true;
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (isWeb()) return getCachedPremium();

  try {
    await initializeIAP();
    const result = await Purchases.getCustomerInfo();
    const isPremium = hasPremiumAccess(unwrapCustomerInfo(result));
    setCachedPremium(isPremium);
    return isPremium;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return getCachedPremium();
  }
}

export async function getProPrice(): Promise<string | null> {
  if (isWeb()) return '$3.99';

  try {
    await initializeIAP();
    const offerings = await Purchases.getOfferings();
    const lifetimePackage = offerings.current?.lifetime ?? offerings.current?.availablePackages?.[0];
    if (lifetimePackage?.product?.priceString) return lifetimePackage.product.priceString;

    const result = await Purchases.getProducts({ productIdentifiers: [PRODUCT_ID] });
    const product = result.products?.find((p: any) => p.identifier === PRODUCT_ID) ?? result.products?.[0];
    return product?.priceString ?? null;
  } catch (error) {
    console.error('Error fetching offerings:', error);
  }
  return null;
}

export async function purchasePro(): Promise<boolean> {
  if (isWeb()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCachedPremium(true);
        resolve(true);
      }, 1500);
    });
  }

  try {
    await initializeIAP();
    const offerings = await Purchases.getOfferings();
    const packageToBuy = offerings.current?.lifetime ?? offerings.current?.availablePackages?.[0];

    let purchaseResult: any;
    if (packageToBuy) {
      purchaseResult = await Purchases.purchasePackage({ aPackage: packageToBuy });
    } else {
      const productsResult = await Purchases.getProducts({ productIdentifiers: [PRODUCT_ID] });
      const product = productsResult.products?.find((p: any) => p.identifier === PRODUCT_ID) ?? productsResult.products?.[0];
      if (!product) throw new Error('Premium product is not available from the store.');
      purchaseResult = await Purchases.purchaseStoreProduct({ product });
    }

    const isPremium = hasPremiumAccess(unwrapCustomerInfo(purchaseResult));
    setCachedPremium(isPremium);
    return isPremium;
  } catch (error: any) {
    if (isCancelled(error)) {
      console.log('User cancelled purchase');
      return false;
    }

    if (isAlreadyPurchased(error)) {
      const restored = await restorePurchases();
      if (restored) return true;
    }

    console.error('Error purchasing:', error);
    throw error;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (isWeb()) return getCachedPremium();

  try {
    await initializeIAP();
    const result = await Purchases.restorePurchases();
    const isPremium = hasPremiumAccess(unwrapCustomerInfo(result));
    setCachedPremium(isPremium);
    return isPremium;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}