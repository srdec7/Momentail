import { Capacitor } from '@capacitor/core';

// ─── AdMob Unit IDs ──────────────────────────────────────────────────────────
// NOTE: @capacitor-community/admob v6 conflicts with RevenueCat on Capacitor 8
// (SPM capacitor-swift-pm version mismatch). Native AdMob is disabled for now.
// The app uses Mock ads on all platforms until a Capacitor-8-compatible AdMob
// plugin becomes available. Real ad revenue is pending this upstream fix.
export const ADMOB_CONFIG = {
  ios: {
    appId:          'ca-app-pub-5036571902202474~7097547929',
    bannerId:       'ca-app-pub-3940256099942544/2934735716',
    interstitialId: 'ca-app-pub-3940256099942544/4411468910',
  },
  android: {
    appId:          'ca-app-pub-5036571902202474~7097547929',
    bannerId:       'ca-app-pub-3940256099942544/6300978111',
    interstitialId: 'ca-app-pub-3940256099942544/1033173712',
  },
};

// ─── Mock Banner State ────────────────────────────────────────────────────────
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

// ─── Mock Interstitial State ──────────────────────────────────────────────────
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

/** Initialize AdMob — no-op until native plugin supports Capacitor 8. */
export async function initializeAdMob() {
  const platform = Capacitor.getPlatform();
  console.log(`[AdMob] Platform: ${platform}. Native AdMob pending Capacitor-8-compatible plugin.`);
}

/** Show banner ad (mock on all platforms for now). */
export async function showBannerAd() {
  setMockBannerVisible(true);
}

/** Hide banner ad. */
export async function hideBannerAd() {
  setMockBannerVisible(false);
}

/** Show interstitial ad (mock overlay). */
export async function showInterstitialAd(): Promise<void> {
  return new Promise(resolve => {
    triggerMockInterstitial(true);
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

/** Manually dismiss the mock interstitial (called by the overlay component). */
export function dismissMockInterstitial() {
  triggerMockInterstitial(false);
}
