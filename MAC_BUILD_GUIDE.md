# macOS Build & Release Guide (Capacitor iOS)

This guide provides step-by-step instructions for macOS users to build, run, and upload the **Momentail** iOS application to the App Store.

---

## 1. Prerequisites

Before starting, ensure your macOS machine has the following tools installed:

1. **Node.js & npm**: Install via [Node.js Official Website](https://nodejs.org/) or using Homebrew (`brew install node`).
2. **Xcode**: Download and install the latest version from the macOS App Store.
3. **CocoaPods**: Required for managing iOS native dependencies. Install via Terminal:
   ```bash
   sudo gem install cocoapods
   # Or on Apple Silicon (M1/M2/M3) Macs if you use Homebrew:
   brew install cocoapods
   ```

---

## 2. Setting Up the Local Repository

1. Open your Terminal application.
2. Clone or navigate to the project directory:
   ```bash
   cd /path/to/your/workspace/Petory_V2
   ```
3. Pull the latest updates from GitHub (make sure you are on the `main` branch):
   ```bash
   git checkout main
   git pull origin main
   ```
4. Install the required Node.js packages:
   ```bash
   npm install --legacy-peer-deps
   ```

---

## 3. Build & Sync Pipeline (Crucial)

To update the native iOS project with the latest React web frontend changes, you **must** follow this command sequence:

### Step 1: Compile the Web Build
This command generates the static files in the `dist/` folder.
```bash
npm run build
```

### Step 2: Sync with iOS Native Platform
This command copies the compiled web files from `dist/` into the iOS native project folder and updates any Capacitor native plugins (like AdMob and RevenueCat).
```bash
npx cap sync ios
```

---

## 4. Building & Running in Xcode

### Step 1: Open the Project in Xcode
Launch Xcode automatically pointing to your iOS project:
```bash
npx cap open ios
```

### Step 2: Configure Signing & Team
Without proper signing, you cannot test on a physical device or publish to the App Store:
1. In the left navigator panel of Xcode, select the **App** project (root node).
2. Select **App** under the "Targets" list in the middle panel.
3. Go to the **Signing & Capabilities** tab.
4. Check **Automatically manage signing**.
5. Select your Apple Developer Account under **Team**.
6. Verify that the **Bundle Identifier** matches your App Store Connect registration (e.g., `com.srdec7.momentail` or similar).

### Step 3: Verify monetization configurations in `Info.plist`
Open `App/App/Info.plist` in Xcode or check it in the navigator. Ensure the following keys exist (already added in the code):
*   **AdMob Application Identifier** (`GADApplicationIdentifier`): Ensure the ID matches your production iOS AdMob App ID.
*   **Privacy - Photo Library & Camera Usage Descriptions** (Needed for pet profile image selection).

### Step 4: Run the App
*   **To Run on Simulator/Device**: Select your target device (e.g., iPhone Simulator or connected physical iPhone) from the top device dropdown and press **Cmd + R** (or click the Play button).
*   **Clean Build Cache**: If you face build issues or dependencies are not linking correctly, clean Xcode's cache using **Shift + Cmd + K** and try running again.

---

## 5. Monetization Testing Checklist (Sandbox Environment)

### AdMob Testing
- While developing or running on simulators/test devices, the codebase is configured to run with `isTesting: true` to avoid account suspension. You should see "Test Ad" banners and mock overlays.
- **For Production Release**: Change `isTesting: true` to `false` in `src/lib/admob.ts` inside `showBannerAd` and `showInterstitialAd` before making the final archive.

### In-App Purchases (RevenueCat) Testing
1. Create a **Sandbox Tester** account in [App Store Connect](https://appstoreconnect.apple.com/) (under *Users and Access -> Sandbox -> Testers*).
2. On your physical iPhone, go to **Settings -> App Store**.
3. Scroll down to **Sandbox Account** and log in with your sandbox tester credentials.
4. Open the Momentail App on your phone and tap **Pro Upgrade** to perform a test purchase. It will process using Apple's Sandbox environment (no real money will be charged).

---

## 6. Archiving & Publishing to App Store

When you are ready to upload the update to App Store Connect:

1. Select **Any iOS Device (arm64)** from the Xcode device target dropdown list.
2. In the top Xcode menu, go to **Product -> Archive**.
3. Once the archiving process completes, the **Organizer** window will open.
4. Click **Distribute App** on the right side.
5. Choose **App Store Connect** and follow the prompts (Destination: *Upload*, keep default options selected).
6. Xcode will sign, package, and upload the build to App Store Connect.
7. Go to App Store Connect website, wait for the build to process, select it for your update version, and submit for review.
