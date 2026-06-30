import { Capacitor } from '@capacitor/core';

export const ADMOB_CONFIG = {
  ios: {
    appId: 'ca-app-pub-5036571902202474~7097547929',
    bannerId: 'ca-app-pub-5036571902202474/3373503875',
    interstitialId: 'ca-app-pub-5036571902202474/3546149876',
  },
  android: {
    appId: 'ca-app-pub-5036571902202474~7097547929',
    bannerId: 'ca-app-pub-5036571902202474/3373503875',
    interstitialId: 'ca-app-pub-5036571902202474/3546149876',
  },
};

const isNative = () => Capacitor.getPlatform() !== 'web';

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
  if (_mockBannerVisible === v) return;
  _mockBannerVisible = v;
  _bannerListeners.forEach(cb => cb(v));
}

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

let _adMob: any = null;
let _initialized = false;
let _nativeBannerVisible = false;

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

async function removeListener(handle: any) {
  try {
    await handle?.remove?.();
  } catch {
    // Listener cleanup failure should not block app flow.
  }
}

export async function initializeAdMob() {
  const plugin = await getAdMob();
  if (!plugin) {
    console.log('[AdMob] Web mode: using mock ads');
    return;
  }
  if (_initialized) return;

  try {
    await plugin.initialize({ requestTrackingAuthorization: true });
    _initialized = true;
    console.log('[AdMob] Initialized successfully');
  } catch (e) {
    console.error('[AdMob] Init error', e);
  }
}

export async function showBannerAd() {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    setMockBannerVisible(true);
    return;
  }

  const plugin = await getAdMob();
  if (!plugin || _nativeBannerVisible) return;

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
      isTesting: false,
    });
    _nativeBannerVisible = true;
  } catch (e) {
    console.error('[AdMob] showBanner error', e);
  }
}

export async function hideBannerAd() {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    setMockBannerVisible(false);
    return;
  }

  const plugin = await getAdMob();
  if (!plugin || !_nativeBannerVisible) return;

  try {
    await plugin.removeBanner();
  } catch (e) {
    console.error('[AdMob] hideBanner error', e);
  } finally {
    _nativeBannerVisible = false;
  }
}

export async function showInterstitialAd(): Promise<void> {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    return new Promise(resolve => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        triggerMockInterstitial(false);
        cleanup();
        resolve();
      };
      const cleanup = onInterstitialRequest(show => {
        if (!show) finish();
      });
      triggerMockInterstitial(true);
      window.setTimeout(finish, 5500);
    });
  }

  const plugin = await getAdMob();
  if (!plugin) return;

  const { InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
  const handles: any[] = [];

  try {
    const unitId = platform === 'ios'
      ? ADMOB_CONFIG.ios.interstitialId
      : ADMOB_CONFIG.android.interstitialId;

    await new Promise<void>(async (resolve) => {
      let finished = false;
      let shown = false;
      let timeoutId: ReturnType<typeof setTimeout>;

      const finish = async () => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        await Promise.all(handles.map(removeListener));
        resolve();
      };

      handles.push(await plugin.addListener(InterstitialAdPluginEvents.Dismissed, finish));
      handles.push(await plugin.addListener(InterstitialAdPluginEvents.FailedToShow, finish));
      handles.push(await plugin.addListener(InterstitialAdPluginEvents.FailedToLoad, finish));
      handles.push(await plugin.addListener(InterstitialAdPluginEvents.Showed, () => { shown = true; }));
      handles.push(await plugin.addListener(InterstitialAdPluginEvents.Loaded, async () => {
        try {
          await plugin.showInterstitial();
        } catch (e) {
          console.error('[AdMob] showInterstitial error', e);
          finish();
        }
      }));

      timeoutId = setTimeout(() => {
        if (!shown) finish();
      }, 15000);

      try {
        await plugin.prepareInterstitial({ adId: unitId, isTesting: false });
      } catch (e) {
        console.error('[AdMob] prepareInterstitial error', e);
        finish();
      }
    });
  } catch (e) {
    console.error('[AdMob] showInterstitial error', e);
    await Promise.all(handles.map(removeListener));
  }
}

export function dismissMockInterstitial() {
  triggerMockInterstitial(false);
}