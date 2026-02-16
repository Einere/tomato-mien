# macOS App Store 배포 가이드

Tomato Mien Electron 앱을 Mac App Store(MAS)에 배포하기 위한 계획 문서.

## 현재 상태

| 항목 | 상태 |
|------|------|
| electron-builder | v26.7.0 설정 완료 |
| 코드 서명 | `Developer ID Application` (DMG 배포용) |
| 공증 (Notarize) | `@electron/notarize` 스크립트 구성 |
| CI/CD | GitHub Actions (`build-and-release.yml`) |
| 빌드 타겟 | DMG (arm64, x64) |
| Entitlements | `build/entitlements.mac.plist` (Sandbox 미포함) |

## 필요한 작업 개요

```
1. Apple Developer 포털 설정
2. Entitlements 파일 추가
3. electron-builder MAS 설정
4. 코드 변경 (electron-updater 분기, notarize 분기)
5. App Store Connect 설정
6. CI/CD 업데이트
7. 빌드, 업로드, 심사 제출
```

---

## 1. Apple Developer 포털 설정

### 1-1. 인증서 발급

DMG 직접 배포와 MAS 배포는 서로 다른 인증서를 사용한다.

| 용도 | 현재 (DMG) | MAS 배포에 필요 |
|------|-----------|----------------|
| 앱 서명 | `Developer ID Application` | `Apple Distribution` |
| 설치 패키지 서명 | 불필요 | `Mac Installer Distribution` |
| 프로비저닝 프로파일 | 불필요 | 필요 (Mac App Store용) |

**방법 A: Xcode에서 발급 (권장)**

Xcode를 사용하면 인증서와 프로비저닝 프로파일을 자동으로 관리할 수 있다.

1. Xcode > Settings (`Cmd + ,`) > Accounts 탭
2. Apple ID가 없으면 `+` 버튼으로 추가
3. Team 선택 > **Manage Certificates...** 클릭
4. 좌측 하단 `+` > `Apple Distribution` 선택하여 생성 (iOS/macOS/tvOS 통합 인증서)
5. 같은 방법으로 `Mac Installer Distribution`도 생성

생성된 인증서는 키체인에 자동 저장된다. CI/CD용 `.p12` 파일 내보내기는 아래 절차를 따른다:

1. 키체인 접근(Keychain Access) 앱 열기
2. 좌측 **내 인증서(My Certificates)** 탭 선택
3. `Apple Distribution: <Team Name>` 인증서를 찾아 왼쪽 화살표를 펼치면 개인 키가 보임
4. 인증서와 개인 키를 함께 선택 (Cmd + 클릭)
5. 우클릭 > **2개 항목 내보내기...** > `.p12` 형식으로 저장 > 비밀번호 설정 (GitHub Secrets의 `APPLE_MAS_APPLICATION_CERT_PASSWORD`)
6. `Mac Installer Distribution` 인증서도 같은 방법으로 내보내기 (`APPLE_MAS_INSTALLER_CERT_PASSWORD`)
7. base64 인코딩: `base64 -i <파일명>.p12 | pbcopy` (클립보드에 복사됨)

> **참고**: `.p12` 내보내기가 비활성화되어 있다면 **내 인증서** 탭에서 선택했는지, 인증서와 개인 키를 모두 선택했는지 확인한다.

**방법 B: Apple Developer 웹 포털에서 발급**

Apple Developer > Certificates, Identifiers & Profiles > Certificates > `+` 버튼에서 직접 발급할 수도 있다. 이 경우 키체인 접근에서 CSR(Certificate Signing Request)을 먼저 생성해야 한다.

### 1-2. App ID 확인

- Identifier: `com.tomato-mien.app` (이미 등록되어 있을 수 있음)
- 미등록 시: Identifiers > `+` > App IDs > Description: `Tomato Mien` 입력 >  Bundle ID: Explicit, `com.tomato-mien.app` 입력
- 별도의 Capabilities 활성화 불필요 (IndexedDB, Notification은 기본 지원)

### 1-3. 프로비저닝 프로파일 생성

1. Profiles > `+` > Mac App Store Connect 선택
2. App ID: `com.tomato-mien.app` 선택
3. Certificate: `Apple Distribution` 선택
4. 다운로드 후 `build/embedded.provisionprofile`로 저장

---

## 2. Entitlements 파일 추가

기존 `build/entitlements.mac.plist`는 DMG 배포용으로 유지하고, MAS 전용 파일을 추가한다.

### 2-1. `build/entitlements.mas.plist` (메인 프로세스용)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- App Sandbox (MAS 필수) -->
    <key>com.apple.security.app-sandbox</key>
    <true/>

    <!-- 네트워크 클라이언트 (외부 링크 열기 등) -->
    <key>com.apple.security.network.client</key>
    <true/>

    <!-- Electron/Chromium 요구사항 -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
</dict>
</plist>
```

### 2-2. `build/entitlements.mas.inherit.plist` (자식 프로세스용)

Renderer, Worker 등 자식 프로세스가 부모 sandbox를 상속받기 위한 설정.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.inherit</key>
    <true/>
</dict>
</plist>
```

### 파일 구조

```
build/
├── entitlements.mac.plist           # 기존 (DMG 배포용)
├── entitlements.mas.plist           # 새로 추가 (MAS 메인 프로세스용)
└── entitlements.mas.inherit.plist   # 새로 추가 (MAS 자식 프로세스용)
```

---

## 3. electron-builder MAS 설정

### 3-1. `package.json` > `build` 섹션에 `mas` 추가

```jsonc
{
  "build": {
    // ... 기존 설정 유지 ...

    "mas": {
      "hardenedRuntime": false,
      "entitlements": "build/entitlements.mas.plist",
      "entitlementsInherit": "build/entitlements.mas.inherit.plist",
      "entitlementsLoginHelper": "build/entitlements.mas.inherit.plist",
      "provisioningProfile": "build/embedded.provisionprofile",
      "category": "public.app-category.productivity",
      "target": [
        {
          "target": "mas",
          "arch": ["arm64", "x64"]
        }
      ]
    }
  }
}
```

### 3-2. npm 스크립트 추가

```jsonc
{
  "scripts": {
    "electron:mas": "npm run build && electron-builder --mac mas",
    "electron:mas:dist": "npm run build && electron-builder --mac mas --publish=never"
  }
}
```

### 3-3. 기존 DMG 설정과의 공존

`electron:build`은 기존 DMG 빌드, `electron:mas`는 MAS 빌드로 분리하여 두 배포 채널을 동시에 유지할 수 있다.

---

## 4. 코드 변경

### 4-1. `electron-updater` MAS 분기

Mac App Store는 자체 업데이트 메커니즘을 사용하므로 `electron-updater`를 비활성화해야 한다.

**`electron/main.js`**:

```javascript
// Electron이 MAS 빌드 시 process.mas를 true로 설정함
const isMAS = process.mas === true;

// 기존 autoUpdater 초기화 부분을 분기
if (!isMAS) {
  setupAutoUpdater();
}
```

### 4-2. `scripts/notarize.js` MAS 분기

MAS 빌드는 Apple이 심사 과정에서 자체 서명하므로 별도 공증이 불필요하다.

```javascript
export default async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== "darwin") return;

  // MAS 빌드 감지 → 공증 스킵
  const buildOptions = context.packager.platformSpecificBuildOptions;
  if (buildOptions?.provisioningProfile) {
    console.log("MAS build detected, skipping notarization.");
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  console.log(`Notarizing ${appName}...`);

  await notarize({
    appBundleId: "com.tomato-mien.app",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });

  console.log("Notarization complete.");
}
```

### 4-3. 기존 기능 호환성

| 기능 | Sandbox 영향 | 대응 |
|------|-------------|------|
| IndexedDB (Dexie) | 영향 없음 | sandbox 컨테이너 내 정상 동작 |
| `app://` 프로토콜 | 영향 없음 | 커스텀 프로토콜 정상 동작 |
| Web Worker | 영향 없음 | renderer 프로세스 내 동작 |
| Notification IPC | 영향 없음 | `com.apple.security.network.client` 불필요 |
| `shell.openExternal` | 영향 없음 | sandbox에서도 외부 URL 열기 가능 |
| Web Audio API | 영향 없음 | renderer 프로세스 내 동작 |

---

## 5. App Store Connect 설정

### 5-1. 앱 등록

1. [App Store Connect](https://appstoreconnect.apple.com) > My Apps > `+` > New App
2. Platform: macOS
3. Name: `Tomato Mien`
4. Primary Language: English
5. Bundle ID: `com.tomato-mien.app`
6. SKU: `tomato-mien` (임의의 고유 문자열)

### 5-2. 앱 메타데이터

| 항목                 | 내용                                             |
|--------------------|------------------------------------------------|
| Category           | 생산성                                            |
| 앱 설명               | Simple Rule-Based Alarm App                    |
| 키워드                | alarm, timer, reminder, productivity, pomodoro |
| Support URL        | `https://einere.github.io/tomato-mien/`        |
| Privacy Policy URL | 필요 (아래 참고)                                     |
| 스크린샷               | 최소 1장 (1280x800 또는 1440x900)                   |

### 5-3. 개인정보 처리방침

App Store 제출에 필수. 이 앱은 개인정보를 수집하지 않으므로 간단한 페이지로 충분하다.

랜딩 페이지(`packages/docs/`)에 `/privacy` 경로로 추가하거나, GitHub Pages에 별도 페이지 생성.

내용 예시:
- 개인정보 수집 항목: 없음
- 데이터 저장: 모든 데이터는 사용자 기기의 IndexedDB에만 저장
- 외부 전송: 없음
- 분석/추적: 없음

### 5-4. 앱 심사 정보

- 데모 계정: 불필요 (로그인 없음)
- 연락처 정보: 심사 담당자가 연락할 수 있는 이메일/전화번호

---

## 6. CI/CD 업데이트

### 6-1. GitHub Secrets 추가

```
APPLE_MAS_APPLICATION_CERT              # Apple Distribution (.p12, base64)
APPLE_MAS_APPLICATION_CERT_PASSWORD     # Apple Distribution .p12 비밀번호
APPLE_MAS_INSTALLER_CERT                # Mac Installer Distribution (.p12, base64)
APPLE_MAS_INSTALLER_CERT_PASSWORD       # Mac Installer Distribution .p12 비밀번호
APP_STORE_CONNECT_API_KEY           # App Store Connect API Key (JSON, 업로드용)
APP_STORE_CONNECT_API_ISSUER        # API Issuer ID
```

### 6-2. `build-and-release.yml` MAS job 추가

```yaml
build-mas:
  runs-on: macos-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "22"
        cache: "npm"

    - name: Install dependencies
      run: npm install

    - name: Install MAS certificates
      env:
        APPLE_MAS_APPLICATION_CERT: ${{ secrets.APPLE_MAS_APPLICATION_CERT }}
        APPLE_MAS_INSTALLER_CERT: ${{ secrets.APPLE_MAS_INSTALLER_CERT }}
        APPLE_MAS_CERT_PASSWORD: ${{ secrets.APPLE_MAS_CERT_PASSWORD }}
      run: |
        KEYCHAIN_PATH=$RUNNER_TEMP/mas-signing.keychain-db
        KEYCHAIN_PASSWORD=$(openssl rand -base64 32)

        security create-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
        security set-keychain-settings -lut 21600 $KEYCHAIN_PATH
        security unlock-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH

        # Application 인증서
        echo -n "$APPLE_MAS_APPLICATION_CERT" | base64 --decode -o $RUNNER_TEMP/mas_app.p12
        security import $RUNNER_TEMP/mas_app.p12 -P "$APPLE_MAS_CERT_PASSWORD" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH

        # Installer 인증서
        echo -n "$APPLE_MAS_INSTALLER_CERT" | base64 --decode -o $RUNNER_TEMP/mas_installer.p12
        security import $RUNNER_TEMP/mas_installer.p12 -P "$APPLE_MAS_CERT_PASSWORD" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH

        security set-key-partition-list -S apple-tool:,apple: -k "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
        security list-keychain -d user -s $KEYCHAIN_PATH

    - name: Copy provisioning profile
      run: |
        mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
        cp build/embedded.provisionprofile ~/Library/MobileDevice/Provisioning\ Profiles/

    - name: Build MAS app
      run: npm run electron:mas:dist

    - name: Upload to App Store Connect
      run: |
        xcrun altool --upload-app \
          --type osx \
          --file release/mas/*.pkg \
          --apiKey ${{ secrets.APP_STORE_CONNECT_API_KEY }} \
          --apiIssuer ${{ secrets.APP_STORE_CONNECT_API_ISSUER }}

    - name: Cleanup
      if: always()
      run: security delete-keychain $RUNNER_TEMP/mas-signing.keychain-db || true
```

---

## 7. 빌드 및 제출 절차

### 7-1. 로컬 테스트 빌드

```bash
# MAS 빌드 (로컬)
npm run electron:mas:dist

# 빌드 결과 확인
ls release/mas/
# → Tomato Mien-2.0.0.pkg
```

### 7-2. Sandbox 테스트

MAS 빌드를 로컬에서 설치하여 sandbox 환경에서 동작을 확인한다.

테스트 항목:
- [ ] 앱 시작 및 SplashScreen → AppShell 전환
- [ ] 규칙 생성/편집/삭제
- [ ] IndexedDB 영속화 (앱 재시작 후 데이터 유지)
- [ ] 알람 트리거 및 Notification 표시
- [ ] 오디오 재생
- [ ] 테마 전환 (light/dark/system)
- [ ] 외부 링크 열기 (`shell.openExternal`)
- [ ] `electron-updater` 비활성화 확인 (MAS 빌드에서 업데이트 체크 안 함)

### 7-3. 업로드 및 심사 제출

1. `xcrun altool` 또는 Transporter.app으로 `.pkg` 업로드
2. App Store Connect에서 업로드된 빌드 확인 (처리에 수 분~수십 분 소요)
3. 빌드 선택 → Submit for Review

---

## 주요 심사 거부 사유 및 대응

| 사유 | 대응 |
|------|------|
| **Sandbox 미적용** | `com.apple.security.app-sandbox` entitlement 필수 |
| **자체 업데이트** | `electron-updater` 코드 MAS 빌드 시 비활성화 |
| **개인정보 처리방침 누락** | 랜딩 페이지에 추가 |
| **최소 기능 미충족** | Tomato Mien은 충분한 기능 보유, 해당 없음 |
| **크래시** | Sandbox 환경에서 충분히 테스트 |
| **불완전한 메타데이터** | 스크린샷, 설명, 키워드 등 모두 입력 |

---

## 비용 및 시간 예상

| 항목 | 비용 | 비고 |
|------|------|------|
| Apple Developer Program | $99/년 | 이미 가입 상태라면 추가 비용 없음 |
| 인증서 발급 | 무료 | Developer Program 포함 |
| App Store 등록비 | 무료 | Developer Program 포함 |
| 심사 기간 | 1~7일 | 첫 제출 시 더 걸릴 수 있음 |

---

## 참고 자료

- [electron-builder MAS 문서](https://www.electron.build/mac-app-store)
- [Apple App Sandbox 가이드](https://developer.apple.com/documentation/security/app-sandbox)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect 도움말](https://developer.apple.com/help/app-store-connect/)
