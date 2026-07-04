# App Store Non-Tracking Submission Guide

Use this guide when the app earns revenue from general AdMob ads and RevenueCat in-app purchases, without personalized cross-app tracking.

## 1. Update App Store Connect

- In `App Privacy`, remove any `Data Used to Track You` declarations that no longer apply.
- Review the `Tracking` answers and make sure they match a non-tracking app submission.
- Keep the privacy answers aligned with general, non-personalized ads.
- Add a short review note that the app does not request ATT because it does not track users across apps or websites for personalized advertising.

## 2. Project State

- ATT permission is not requested on launch.
- `NSUserTrackingUsageDescription` is removed from iOS `Info.plist`.
- AdMob remains enabled for general ads.
- Interstitial ad requests use `npa: true` to request non-personalized ads.
- RevenueCat purchase and restore flows remain enabled.

## 3. Review Notes Text

Use this in App Review Notes:

```text
This app does not use App Tracking Transparency because it does not track users across apps or websites for personalized advertising.
The app uses Google AdMob for general non-personalized ads and RevenueCat for in-app purchases.
We have removed the iOS tracking usage description and do not request ATT permission on launch.
```

## 4. Submission Checklist

1. Review `App Privacy` answers in App Store Connect.
2. Install the app fresh on iPhone or iPad.
3. Confirm that no ATT prompt appears.
4. Confirm that ads still load normally.
5. Confirm that premium purchase and restore still work.
6. Confirm that the latest web bundle is synced into the iOS project.

## 5. If Apple Asks Again

- The app does not use personalized cross-app tracking.
- The app is submitted as a non-tracking app.
- Monetization comes from general AdMob ads and in-app purchases.
- App Privacy details were updated to match the current app behavior.
