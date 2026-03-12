# Tomato Mien

가벼운 규칙 기반 알리미 데스크톱 앱

[Homepage](https://einere.github.io/tomato-mien/) | [Releases](https://github.com/Einere/tomato-mien/releases)

## 기능

- **규칙 기반 알림**: 간격(매 N분), 특정 시각, 매시 N분 등 다양한 트리거 조합
- **필터 조건**: 시간 범위로 알림 활성 구간 제한 (예: 근무 시간에만 알림)
- **뽀모도로 타이머**: 플러그인으로 제공되는 집중/휴식 타이머
- **백그라운드 알림**: Web Worker 기반 하이브리드 스케줄링 (Timer + Safety Net + liveQuery)
- **오프라인 동작**: IndexedDB 영속화, 네트워크 연결 불필요
- **자동 업데이트**: GitHub Releases를 통한 인앱 업데이트
- **크로스 플랫폼**: macOS, Windows, Linux 지원

## 설치

### 앱 내려받기

[Releases](https://github.com/Einere/tomato-mien/releases) 페이지에서 플랫폼별 최신 버전을 받으세요.

| 플랫폼  | 파일 형식                |
| ------- | ------------------------ |
| macOS   | `.dmg` (arm64, x64)      |
| Windows | `.exe` (x64, arm64)      |
| Linux   | `.AppImage` (x64, arm64) |

### 직접 빌드

```bash
npm install
npm run build
npm run electron:release
```

### macOS 빌드 프로필

- `npm run electron:mas:dev`: 로컬 Mac App Store Sandbox 테스트용 (`electron/entitlements/embedded.dev.provisionprofile`)
- `npm run electron:mas:dist`: Mac App Store 제출용 (`electron/entitlements/embedded.mas.provisionprofile`)
- `npm run electron:dist`: Mac App Store 외부 배포용 (`Developer ID Application` 서명 + 공증)

## 프로젝트 구조

npm workspaces 기반 모노레포:

```
packages/
  design-tokens/     # CSS 디자인 토큰 — OKLCH 컬러, typography (@tomato-mien/design-tokens)
  ui/                # React UI 프리미티브 — CVA + tailwind-merge (@tomato-mien/ui)
  view-transition/   # SPA drill/slide 애니메이션 (@tomato-mien/view-transition)
  plugin-core/       # 플러그인 타입 정의 (@tomato-mien/plugin-core)
  plugin-pomodoro/   # 뽀모도로 타이머 플러그인 (@tomato-mien/plugin-pomodoro)
  docs/              # 랜딩 페이지 (@tomato-mien/docs)
src/                 # Electron 렌더러 (React SPA)
electron/            # Electron 메인/프리로드
```

### 플러그인 시스템

`@tomato-mien/plugin-core`의 `TomatoPlugin` 인터페이스를 구현하면 뷰와 네비게이션 아이템을 앱에 추가할 수 있습니다. 현재 뽀모도로 타이머가 빌트인 플러그인으로 제공됩니다.

## 개발

```bash
# Electron + Vite 개발 서버
npm run electron:dev

# Vite 개발 서버만 (http://localhost:5173)
npm run dev

# 랜딩 페이지 개발 서버
npm run docs:dev

# 린트
npm run lint

# 테스트
npx vitest run
```

> **참고**: `npm run dev`(브라우저 환경)에서는 Autoplay Policy로 인해 알람 사운드가 재생되지 않을 수 있습니다. 알람 사운드 테스트는 `npm run electron:dev`로 실행하세요.

## 기술 스택

| 영역       | 기술                                     |
| ---------- | ---------------------------------------- |
| Frontend   | React 19, TypeScript, Tailwind CSS v4    |
| Desktop    | Electron, electron-builder               |
| State      | Jotai (atomWithStorage + Dexie 영속화)   |
| Schema     | Zod                                      |
| Storage    | Dexie (IndexedDB)                        |
| Background | Web Worker API                           |
| Build      | Vite, npm workspaces                     |
| Test       | Vitest, Testing Library                  |
| CI/CD      | GitHub Actions (빌드/릴리스, Pages 배포) |

## 기여

이슈 및 PR은 언제나 환영합니다.

## 라이선스

[MIT](LICENSE)
