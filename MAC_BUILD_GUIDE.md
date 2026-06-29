# Comprehensive Build Guide for Mac (App Store & Play Store)

This guide provides step-by-step instructions for taking the source code of **Momentail** from GitHub and building it on your Mac, resolving common environment issues, and successfully deploying it to the Apple App Store or Google Play Store.

---

## 1. Prerequisites (Mac Setup)

Before you begin, ensure your Mac has the following software installed:

### 1.1 Node.js & npm
You need Node.js to install JavaScript dependencies.
- **Download**: Install from [Node.js Official Website](https://nodejs.org/) (Use the LTS version).
- **Verify**: Open Terminal and run:
  ```bash
  node -v
  npm -v
  ```

### 1.2 Xcode (For iOS)
- **Download**: Install Xcode from the Mac App Store.
- **Command Line Tools**: Open Terminal and run:
  ```bash
  xcode-select --install
  ```
- **CocoaPods**: Required for managing iOS native dependencies.
  ```bash
  sudo gem install cocoapods
  ```

### 1.3 Android Studio (For Android)
- **Download**: Install from [Android Studio Official Website](https://developer.android.com/studio).
- **Setup**: Open Android Studio, go to SDK Manager, and ensure you have the latest Android SDK Platform and Build Tools installed.

---

## 2. Cloning and Installing the Project

### 2.1 Clone the Repository
Open Terminal and clone your project:
```bash
git clone https://github.com/srdec7/Momentail.git
cd Momentail
```

### 2.2 Install Dependencies
Install all Node.js dependencies. We use `--legacy-peer-deps` to avoid version conflicts with React 18 in some Capacitor plugins.
```bash
npm install --legacy-peer-deps
```

---

## 3. Important: API Keys & Credentials Setup

Before building, you **MUST** insert your real API keys. Currently, they are set to placeholders.

### 3.1 Google AdMob App ID
You must replace the placeholder `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX` with your actual AdMob App IDs from your AdMob Dashboard.

- **iOS**: Open `ios/App/App/Info.plist`
  Find the `<key>GADApplicationIdentifier</key>` and replace the `<string>` below it with your **iOS AdMob App ID**.
- **Android**: Open `android/app/src/main/AndroidManifest.xml`
  Find `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="..." />` and replace the value with your **Android AdMob App ID**.

### 3.2 RevenueCat Public API Keys
You need your RevenueCat Public API keys for in-app purchases to work.
- Open `src/lib/iap.ts`.
- Ensure `Purchases.configure({ apiKey: "YOUR_REVENUECAT_PUBLIC_KEY" });` is using your actual Apple or Google RevenueCat API keys for the respective platforms.

---

## 4. Building the Web App & Syncing Native Code

Every time you change the JavaScript/TypeScript code, you must build it and sync it to the native folders.

### 4.1 Build the Web Assets
```bash
npm run build
```
This command compiles your React/Vite code into the `dist/` folder.

### 4.2 Sync with iOS and Android
Sync the `dist/` folder and any new plugins into your native projects:
```bash
npx cap sync
```
*(If you only want to sync one platform, you can run `npx cap sync ios` or `npx cap sync android`)*

---

## 5. Building and Releasing for iOS (App Store)

### 5.1 Open Xcode
Open the iOS project in Xcode directly from the terminal:
```bash
npx cap open ios
```

### 5.2 Configure Signing & Capabilities
1. In Xcode, click on **App** in the left project navigator.
2. Select the **App** target in the middle pane.
3. Go to the **Signing & Capabilities** tab.
4. Check **"Automatically manage signing"**.
5. Select your Apple Developer Account from the **Team** dropdown.
6. Ensure your **Bundle Identifier** matches exactly what is registered in App Store Connect and RevenueCat.

### 5.3 Clean and Build
If you ever face weird errors, always clean the build folder first:
- In the top menu bar, click **Product** > **Clean Build Folder** (`Shift + Cmd + K`).
- Then, select your target device (e.g., Any iOS Device) and click **Product** > **Archive** to build the app for submission.

### 5.4 Submit to App Store Connect
Once the Archive process is complete, the **Organizer** window will pop up. Click **Distribute App** and follow the prompts to upload it to App Store Connect.

---

## 6. Building and Releasing for Android (Google Play Store)

### 6.1 Open Android Studio
Open the Android project:
```bash
npx cap open android
```

### 6.2 Gradle Sync
Wait for Android Studio to automatically sync the Gradle files. If it doesn't, click the "Sync Project with Gradle Files" button (an elephant icon with a blue arrow).

### 6.3 Generate Signed Bundle (AAB)
1. In the top menu bar, click **Build** > **Generate Signed Bundle / APK...**
2. Select **Android App Bundle** (required for Google Play) and click Next.
3. Provide your Keystore path, Keystore password, Key alias, and Key password. (If you don't have one, click "Create new...").
4. Select the **release** build variant and click Finish.

### 6.4 Upload to Google Play Console
Locate the generated `.aab` file (usually inside `android/app/release/`) and upload it to the Google Play Console under your release track.

---

## Troubleshooting Common Mac Build Errors

- **Pod install failed** or **CocoaPods not found**: 
  Ensure CocoaPods is installed (`sudo gem install cocoapods`). If you are on an Apple Silicon Mac (M1/M2/M3), you might need to install via Homebrew: `brew install cocoapods`.
- **Product not loaded (RevenueCat)**: 
  Ensure you are testing on a real device with a Sandbox Apple ID. RevenueCat will not work properly on an iOS Simulator.
- **Ads not showing**: 
  Make sure you replaced the placeholder AdMob App IDs and that you have a valid internet connection. If testing locally, ensure test ads are enabled in the AdMob configuration within `capacitor.config.ts` or `src/lib/admob.ts`.
