import { Capacitor } from '@capacitor/core';

// ─── AdMob Unit IDs ──────────────────────────────────────────────────────────
// Replace bannerId/interstitialId with your real AdMob ad unit IDs from
// https://admob.google.com → Apps → Ad Units
export const ADMOB_CONFIG = {
  ios: {
    appId:          'ca-app-pub-5036571902202474~7097547929',
    bannerId:       'ca-app-pub-5036571902202474/3373503875',
    interstitialId: 'ca-app-pub-5036571902202474/3546149876',
  },
  android: {
    appId:          'ca-app-pub-5036571902202474~7097547929',
    bannerId:       'ca-app-pub-5036571902202474/3373503875',
    interstitialId: 'ca-app-pub-5036571902202474/3546149876',
  },
};

// ─── Platform Detection ───────────────────────────────────────────────────────
const isNative = () => Capacitor.getPlatform() !== 'web';

// ─── Mock Banner State (web fallback) ────────────────────────────────────────
let _mockBannerVisible = false;
const _bannerListeners: ((visible: boolean) => void)[] = [];

export function onBannerVisibilityChange(cb: (visible: boolean) => void) {
  _bannerListeners.push(cb);
  cb(_mockBannerVisible);
  return () => {
    const idx = _bannerListeners.indexOf(cb);
    if (idx !== -1) _bannerListeners.splice(idx, 1);
  };
}

function setMockBannerVisible(v: boolean) {
  _mockBannerVisible = v;
  _bannerListeners.forEach(cb => cb(v));
}

// ─── Mock Interstitial State (web fallback) ───────────────────────────────────
const _interstitialListeners: ((show: boolean) => void)[] = [];

export function onInterstitialRequest(cb: (show: boolean) => void) {
  _interstitialListeners.push(cb);
  return () => {
    const idx = _interstitialListeners.indexOf(cb);
    if (idx !== -1) _interstitialListeners.splice(idx, 1);
  };
}

function triggerMockInterstitial(show: boolean) {
  _interstitialListeners.forEach(cb => cb(show));
}

// ─── Lazy AdMob plugin loader (native only) ───────────────────────────────────
let _adMob: any = null;
async function getAdMob() {
  if (!isNative()) return null;
  if (!_adMob) {
    try {
      const mod = await import('@capacitor-community/admob');
      _adMob = mod.AdMob;
    } catch {
      console.warn('[AdMob] Native plugin not available');
    }
  }
  return _adMob;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Initialize AdMob — call once on app start. */
export async function initializeAdMob() {
  const plugin = await getAdMob();
  if (!plugin) {
    console.log('[AdMob] Web mode: using mock ads');
    return;
  }
  try {
    await plugin.initialize({ requestTrackingAuthorization: true });
    console.log('[AdMob] Initialized successfully');
  } catch (e) {
    console.error('[AdMob] Init error', e);
  }
}

/** Show banner ad at bottom of screen. */
export async function showBannerAd() {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    setMockBannerVisible(true);
    return;
  }

  const plugin = await getAdMob();
  if (!plugin) return;

  try {
    const { BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
    const unitId = platform === 'ios'
      ? ADMOB_CONFIG.ios.bannerId
      : ADMOB_CONFIG.android.bannerId;

    await plugin.showBanner({
      adId: unitId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false, // ← set to true during development
    });
  } catch (e) {
    console.error('[AdMob] showBanner error', e);
  }
}

/** Hide (remove) banner ad — call after premium purchase. */
export async function hideBannerAd() {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    setMockBannerVisible(false);
    return;
  }

  const plugin = await getAdMob();
  if (!plugin) return;

  try {
    await plugin.removeBanner();
  } catch (e) {
    console.error('[AdMob] hideBanner error', e)
  }
}

/** Show interstitial ad — call on key user actions for non-premium users. */
export async function showInterstitialAd(): Promise<void> {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    return new Promise(resolve => {
      triggerMockInterstitial(true);
      const timer = setTimeout(() => {
        triggerMockInterstitial(false);
        resolve();
      }, 4000);
      const cleanup = onInterstitialRequest(show => {
        if (!show) { clearTimeout(timer); cleanup(); resolve(); }
      });
    });
  }

  const plugin = await getAdMob();
  if (!plugin) return;

  try {
    const unitId = platform === 'ios'
      ? ADMOB_CONFIG.ios.interstitialId
      : ADMOB_CONFIG.android.interstitialId;

    await plugin.prepareInterstitial({ adId: unitId, isTesting: false });
    await plugin.showInterstitial();
  } catch (e) {
    console.error('[AdMob] showInterstitial error', e);
  }
}

/** Manually dismiss the mock interstitial (called by the overlay component). */
export function dismissMockInterstitial() {
  triggerMockInterstitial(false);
}
