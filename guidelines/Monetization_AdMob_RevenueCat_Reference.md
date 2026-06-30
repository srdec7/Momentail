# 모바일 수익화 레퍼런스: AdMob + RevenueCat

Momentail에서 AdMob 광고와 RevenueCat 인앱결제를 수정하면서 정리한 기준입니다. 다음에 모바일 앱이나 모바일 게임을 만들 때, 광고/프리미엄/인앱결제를 넣기 전에 이 문서를 먼저 확인합니다.

## 핵심 원칙

Native 광고와 인앱결제는 일반 웹 UI가 아니라 플랫폼 기능으로 취급해야 합니다.

- AdMob 배너는 WebView 안의 React 컴포넌트가 아니라 native overlay입니다.
- Native 배너는 화면 위에 떠서 하단 메뉴, 저장 버튼, 게임 조작 버튼을 가릴 수 있습니다.
- Interstitial 광고는 앱 흐름 중간에 끼는 gate입니다. 로드 실패나 표시 실패가 나도 반드시 앱 흐름으로 돌아와야 합니다.
- RevenueCat이 프리미엄 권한의 기준입니다. `localStorage`는 빠른 캐시로만 사용합니다.
- `dist`에서 잘 동작해도 iOS/Android native assets에 최신 번들이 들어가지 않으면 실제 기기에서는 예전 코드가 실행됩니다.

## 기본 제품 설계 기준

하단 메뉴, 저장 버튼, 입력 폼, 에디터, 게임 조작 UI가 있는 앱에서는 다음을 기본값으로 둡니다.

- 배너 광고보다 Interstitial 광고를 우선합니다.
- 하단 배너는 기본적으로 사용하지 않습니다.
- 배너가 꼭 필요하면 처음부터 광고 영역을 UI 레이아웃 안에 실제 공간으로 확보합니다.
- Native overlay 배너를 fixed bottom menu 위에 얹지 않습니다.
- 프리미엄 업셀은 fake 광고나 placeholder가 아니라 앱 내부 React UI로 만듭니다.

Momentail의 최종 결정:

- 배너 광고는 제거했습니다.
- 배너가 하단 메뉴와 저장 버튼 흐름을 방해할 수 있었기 때문입니다.
- Interstitial 광고는 유지했습니다.

## AdMob 체크리스트

개발 중에는 반드시 Google 공식 테스트 광고 ID를 사용합니다.

- iOS 테스트 배너: `ca-app-pub-3940256099942544/2934735716`
- iOS 테스트 Interstitial: `ca-app-pub-3940256099942544/4411468910`
- Android 테스트 배너: `ca-app-pub-3940256099942544/6300978111`
- Android 테스트 Interstitial: `ca-app-pub-3940256099942544/1033173712`

기기 테스트 전 확인할 것:

- `ios/App/App/Info.plist`에 `GADApplicationIdentifier`가 있는지 확인합니다.
- `android/app/src/main/AndroidManifest.xml`에 Android AdMob App ID가 있는지 확인합니다.
- AdMob 초기화는 앱 시작 시 한 번만 합니다.
- Capacitor `registerPlugin`으로 만든 plugin proxy 자체를 `await`하지 않습니다.
- plugin method를 직접 호출합니다.
- 초기화, 광고 ID 선택, prepare, show, dismissed, failed-to-load, failed-to-show 로그를 남깁니다.
- JS 변경 후 항상 빌드와 sync를 합니다.

```bash
npm run build
npx cap sync ios
```

- `dist/index.html`과 `ios/App/App/public/index.html`이 같은 최신 `assets/index-*.js`를 가리키는지 확인합니다.

## 배너 광고 기준

기본 추천: 중요한 하단 UI가 있는 앱에서는 native 배너 광고를 사용하지 않습니다.

배너를 꼭 써야 한다면:

- 광고가 들어갈 실제 레이아웃 공간을 확보합니다.
- 하단 메뉴, 저장 버튼, 입력 폼, 게임 조작 UI 위에 겹치지 않게 합니다.
- 모든 주요 화면을 실제 기기에서 터치 테스트합니다.
- 모달, 키보드 화면, bottom sheet, 저장 화면까지 확인합니다.
- 프리미엄 권한이 확인되면 즉시 배너를 제거합니다.

Momentail에서 배운 점:

- 배너 위치를 margin으로 조정해도 다른 화면의 버튼을 방해할 수 있습니다.
- 화면마다 하단 UI 높이가 달라서 배너 안정성이 떨어집니다.
- 이 앱에서는 배너 제거가 더 안정적인 선택입니다.

## Interstitial 광고 기준

Interstitial 광고는 사용자를 가두면 안 됩니다.

구현 기준:

- 하나의 함수에서 prepare와 show를 안전하게 처리합니다.
- dismissed, failed-to-load, failed-to-show listener를 둡니다.
- 광고가 닫히거나 실패하면 항상 원래 앱 동작을 계속합니다.
- SDK 이벤트가 오지 않는 경우를 대비해 timeout fallback을 둡니다.
- 저장, 리포트 열기, 타임라인 작성 같은 핵심 동작을 광고 대기 때문에 영구 정지시키지 않습니다.
- premium 사용자는 광고를 완전히 skip합니다.

추천 흐름:

1. 사용자가 광고 대상 기능을 누릅니다.
2. premium이면 기능을 바로 실행합니다.
3. non-premium이면 Interstitial을 요청합니다.
4. 광고 dismiss, fail, timeout 중 하나가 발생하면 앱 기능을 계속 실행합니다.

## RevenueCat 체크리스트

RevenueCat은 premium 권한 판정의 기준입니다.

- 앱 시작 시 RevenueCat을 먼저 configure합니다.
- 현재 플랫폼에 맞는 RevenueCat public API key를 사용합니다.
- RevenueCat dashboard의 entitlement identifier와 앱 코드의 identifier가 정확히 일치해야 합니다.
- premium 판정은 `customerInfo.entitlements.active`를 기준으로 합니다.
- product ID만 보고 premium으로 처리하지 않습니다. product ID fallback은 보조 수단으로만 둡니다.
- purchase 성공 후 즉시 customer info를 다시 가져옵니다.
- restore purchases 후에도 customer info를 다시 가져옵니다.
- `localStorage` premium 값은 캐시로만 사용하고 최종 권한은 RevenueCat으로 다시 확인합니다.

앱 시작 추천 흐름:

1. RevenueCat configure.
2. CustomerInfo fetch.
3. active entitlement 확인.
4. premium state 업데이트.
5. local cache 업데이트.
6. premium 여부에 따라 광고 표시/skip 결정.

구매 추천 흐름:

1. offerings 로드.
2. 사용자가 package 선택.
3. purchase 실행.
4. purchase 후 customer info refresh.
5. entitlement active이면 premium unlock.
6. 이미 구매했다는 메시지가 나오면 restore/sync 실행.
7. restore/sync 후 customer info refresh.
8. 최종 메시지는 StoreKit 결과가 아니라 entitlement 활성 여부 기준으로 보여줍니다.

## 자주 발생한 문제와 원인

하얀 화면에 회색 점만 깜빡임:

- iOS native 프로젝트에 예전 JS 번들이 들어갔을 가능성이 큽니다.
- `npm run build`와 `npx cap sync ios`를 다시 실행합니다.
- `ios/App/App/public/index.html`이 최신 bundle hash를 가리키는지 확인합니다.
- Xcode device console에서 JS runtime error를 확인합니다.

AdMob 로그가 전혀 없음:

- 실제 기기 앱이 예전 번들을 실행 중일 수 있습니다.
- AdMob 초기화 코드가 실행되지 않을 수 있습니다.
- Capacitor plugin proxy를 잘못 `await`해서 멈출 수 있습니다.
- native plugin이 현재 설치된 앱에 포함되지 않았을 수 있습니다.

Placeholder 광고가 보임:

- native AdMob이 아니라 React fallback UI가 보이는 상황입니다.
- 실제 기기 테스트에서는 fake placeholder를 production-like 광고처럼 쓰지 않습니다.
- device log에서 native `prepareInterstitial`, `showInterstitial`, `showBanner` 호출이 있는지 확인합니다.

구매했는데 다시 구매하라고 나옴:

- RevenueCat entitlement identifier가 코드와 dashboard에서 다를 수 있습니다.
- purchase 후 customer info refresh가 빠졌을 수 있습니다.
- restore 후 premium state 업데이트가 빠졌을 수 있습니다.
- product는 구매됐지만 entitlement mapping이 잘못되어 active entitlement가 비어 있을 수 있습니다.

배너가 UI를 가림:

- native banner가 WebView 위에 overlay로 뜨고 있을 수 있습니다.
- margin으로 위치를 조정해도 다른 화면의 버튼을 가릴 수 있습니다.
- 하단 UI가 중요한 앱에서는 배너 제거 또는 실제 레이아웃 슬롯 확보가 더 안전합니다.

## 실제 기기 테스트 체크리스트

수익화 기능은 실제 iPhone/Android 기기에서 확인하기 전까지 완료로 보지 않습니다.

- 앱 완전 종료 후 cold start.
- 기존 사용자로 재시작.
- non-premium 상태에서 리포트 클릭.
- non-premium 상태에서 타임라인 저장.
- Interstitial 정상 표시 후 닫기.
- Interstitial 로드 실패/timeout 시 앱 흐름 계속 여부.
- premium 구매 성공.
- 이미 구매한 상품 메시지.
- restore purchases.
- premium 구매 후 앱 재시작.
- premium 사용자는 광고가 없어야 합니다.
- non-premium 사용자는 의도한 광고만 보여야 합니다.
- 하단 메뉴, 저장 버튼, 모달 버튼이 모두 터치 가능해야 합니다.

## 빌드 및 푸시 체크리스트

수익화 관련 코드를 바꿀 때마다 다음 순서로 진행합니다.

1. source code 수정.
2. 빌드.
   ```bash
   npm run build
   ```
3. native sync.
   ```bash
   npx cap sync ios
   ```
4. `dist/index.html`과 `ios/App/App/public/index.html`의 bundle hash 비교.
5. iOS public bundle에서 기대하는 SDK 호출 또는 제거된 호출을 직접 검색.
6. source와 native public bundle을 함께 commit.
7. GitHub push.
8. Mac에서 pull.
9. iPhone에 재설치 후 device log로 확인.

## 다음 앱/게임의 기본 템플릿

별도 요구가 없으면 다음 구성을 기본값으로 사용합니다.

- Premium 권한 관리는 RevenueCat으로 합니다.
- 광고는 non-premium 사용자에게만 표시합니다.
- 하단 UI가 중요한 앱에서는 banner 광고를 넣지 않습니다.
- 광고는 Interstitial 중심으로 넣습니다.
- 광고 실패 시 앱 기능은 계속 실행되게 합니다.
- premium 확인 후 광고는 즉시 skip합니다.
- native 테스트 전에는 항상 build, cap sync, GitHub push, Mac pull, device reinstall을 합니다.
