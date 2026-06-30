import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize, InterstitialAdPluginEvents } from '@capacitor-community/admob';

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
const AD_TEST_MODE = true;

const ADMOB_TEST_UNITS = {
  ios: {
    bannerId: 'ca-app-pub-3940256099942544/2934735716',
    interstitialId: 'ca-app-pub-3940256099942544/4411468910',
  },
  android: {
    bannerId: 'ca-app-pub-3940256099942544/6300978111',
    interstitialId: 'ca-app-pub-3940256099942544/1033173712',
  },
};

function getAdUnitId(platform: string, type: 'bannerId' | 'interstitialId') {
  const units = AD_TEST_MODE ? ADMOB_TEST_UNITS : ADMOB_CONFIG;
  return platform === 'ios' ? units.ios[type] : units.android[type];
}

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

function showMockInterstitialOverlay(): Promise<void> {
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

let _adMob: any = null;
let _initialized = false;
let _initializing: Promise<void> | null = null;
let _nativeBannerVisible = false;

async function getAdMob() {
  const platform = Capacitor.getPlatform();
  console.log('[PetoryAds] Resolving AdMob plugin', { platform, isNative: isNative(), hasPlugin: Boolean(AdMob) });
  if (!isNative()) return null;
  if (!_adMob) _adMob = AdMob;
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
  console.log('[PetoryAds] initializeAdMob requested', { platform: Capacitor.getPlatform() });
  const plugin = await getAdMob();
  if (!plugin) {
    console.log('[AdMob] Web mode: using mock ads');
    return;
  }
  if (_initialized) return;
  if (_initializing) return _initializing;

  _initializing = (async () => {
    try {
      console.log('[AdMob] Initializing', { platform: Capacitor.getPlatform(), testMode: AD_TEST_MODE });
      await plugin.initialize({ requestTrackingAuthorization: false, initializeForTesting: AD_TEST_MODE });
      _initialized = true;
      console.log('[AdMob] Initialized successfully');
    } catch (e) {
      console.error('[AdMob] Init error', e);
    } finally {
      _initializing = null;
    }
  })();

  return _initializing;
}

export async function showBannerAd() {
  const platform = Capacitor.getPlatform();
  console.log('[PetoryAds] showBannerAd requested', { platform, alreadyVisible: _nativeBannerVisible });

  if (platform === 'web') {
    setMockBannerVisible(true);
    return;
  }

  await initializeAdMob();
  const plugin = await getAdMob();
  if (_nativeBannerVisible) return;
  if (!plugin) {
    console.warn('[AdMob] Banner plugin unavailable');
    return;
  }

  try {
    const unitId = getAdUnitId(platform, 'bannerId');
    console.log('[AdMob] Showing banner', { platform, adId: unitId, testMode: AD_TEST_MODE });

    await plugin.showBanner({
      adId: unitId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: AD_TEST_MODE,
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

  setMockBannerVisible(false);
  await initializeAdMob();
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
  console.log('[PetoryAds] showInterstitialAd requested', { platform });


  if (platform === 'web') {
    return;
  }

  await initializeAdMob();
  const plugin = await getAdMob();
  if (!plugin) {
    console.warn('[AdMob] Interstitial plugin unavailable');
    return;
  }

  const handles: any[] = [];

  try {
    const unitId = getAdUnitId(platform, 'interstitialId');
    console.log('[AdMob] Showing interstitial', { platform, adId: unitId, testMode: AD_TEST_MODE });

    await new Promise<void>(async (resolve) => {
      let finished = false;
      let timeoutId: ReturnType<typeof setTimeout>;

      const finish = async (showFallback = false) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        await Promise.all(handles.map(removeListener));
        if (showFallback && platform === 'web') await showMockInterstitialOverlay();
        resolve();
      };

      handles.push(await plugin.addListener(InterstitialAdPluginEvents.Dismissed, finish));
      handles.push(await plugin.addListener(InterstitialAdPluginEvents.FailedToShow, (error: any) => {
        console.error('[AdMob] interstitial failed to show', error);
        finish(true);
      }));
      handles.push(await plugin.addListener(InterstitialAdPluginEvents.FailedToLoad, (error: any) => {
        console.error('[AdMob] interstitial failed to load', error);
        finish(true);
      }));

      timeoutId = setTimeout(() => finish(true), 12000);

      try {
        await plugin.prepareInterstitial({ adId: unitId, isTesting: AD_TEST_MODE });
        await plugin.showInterstitial();
      } catch (e) {
        console.error('[AdMob] prepare/show interstitial error', e);
        finish(true);
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