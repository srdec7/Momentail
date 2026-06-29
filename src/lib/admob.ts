import { Capacitor } from '@capacitor/core';

// ─── AdMob Unit IDs ──────────────────────────────────────────────────────────
// TODO: Replace with your real AdMob unit IDs before App Store / Play Store release
export const ADMOB_CONFIG = {
  // iOS
  ios: {
    appId:        'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',  // Info.plist 에도 등록 필요
    bannerId:     'ca-app-pub-3940256099942544/2934735716',  // Google 테스트 ID (개발용)
    interstitialId: 'ca-app-pub-3940256099942544/4411468910', // Google 테스트 ID (개발용)
  },
  // Android
  android: {
    appId:        'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',  // AndroidManifest.xml 에도 등록 필요
    bannerId:     'ca-app-pub-3940256099942544/6300978111',  // Google 테스트 ID (개발용)
    interstitialId: 'ca-app-pub-3940256099942544/1033173712', // Google 테스트 ID (개발용)
  },
};

// ─── Platform Detection ───────────────────────────────────────────────────────
const isNative = () => Capacitor.getPlatform() !== 'web';

// ─── Lazy plugin import (only on native) ─────────────────────────────────────
let AdMob: any = null;
async function getAdMob() {
  if (!isNative()) return null;
  if (!AdMob) {
    try {
      const mod = await import('@capacitor-community/admob');
      AdMob = mod.AdMob;
    } catch {
      console.warn('[AdMob] Plugin not available.');
    }
  }
  return AdMob;
}

// ─── Mock Banner State (web) ──────────────────────────────────────────────────
let _mockBannerVisible = false;
const _bannerListeners: ((visible: boolean) => void)[] = [];

export function onBannerVisibilityChange(cb: (visible: boolean) => void) {
  _bannerListeners.push(cb);
  // Immediately call with current state
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

// ─── Mock Interstitial State (web) ────────────────────────────────────────────
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

// ─── Public API ───────────────────────────────────────────────────────────────

/** Initialize AdMob — call once on app start (only has effect on native). */
export async function initializeAdMob() {
  const plugin = await getAdMob();
  if (!plugin) return;
  try {
    await plugin.initialize({ requestTrackingAuthorization: true });
    console.log('[AdMob] Initialized successfully');
  } catch (e) {
    console.error('[AdMob] Init error', e);
  }
}

/** Show banner ad at bottom of screen. No-op for premium users. */
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
      isTesting: true, // ← TODO: set false for production
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
    console.error('[AdMob] hideBanner error', e);
  }
}

/** Show interstitial ad — call on key user actions for non-premium users. */
export async function showInterstitialAd(): Promise<void> {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    // Trigger mock interstitial overlay and wait until it's dismissed
    return new Promise(resolve => {
      triggerMockInterstitial(true);
      // The MockInterstitial component will call this after 4 s or manual close
      const timer = setTimeout(() => {
        triggerMockInterstitial(false);
        resolve();
      }, 4000);

      const cleanup = onInterstitialRequest(show => {
        if (!show) {
          clearTimeout(timer);
          cleanup();
          resolve();
        }
      });
    });
  }

  const plugin = await getAdMob();
  if (!plugin) return;

  try {
    const unitId = platform === 'ios'
      ? ADMOB_CONFIG.ios.interstitialId
      : ADMOB_CONFIG.android.interstitialId;

    await plugin.prepareInterstitial({ adId: unitId, isTesting: true });
    await plugin.showInterstitial();
  } catch (e) {
    console.error('[AdMob] showInterstitial error', e);
  }
}

/** Manually dismiss the mock interstitial (called by the overlay component). */
export function dismissMockInterstitial() {
  triggerMockInterstitial(false);
}
