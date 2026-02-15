# Tomato Mien

가벼운 규칙 기반 알리미 데스크톱 앱

[Homepage](https://einere.github.io/tomato-mien/) | [Releases](https://github.com/Einere/tomato-mien/releases)

## 기능

- 트리거 기반 알림: 간격(매 N분), 특정 시각 조건 지원
- 필터 조건: 시간 범위로 알림 활성 구간 제한
- 백그라운드 알림 (Web Worker)
- IndexedDB 기반 데이터 영속화
- 네트워크 연결 불필요

## 설치 및 실행

### 앱 내려받기

[Releases](https://github.com/Einere/tomato-mien/releases) 페이지에서 플랫폼별 최신 버전을 받아주세요.

| 플랫폼  | 파일 형식                |
| ------- | ------------------------ |
| macOS   | `.dmg` (arm64, x64)      |
| Windows | `.exe` (x64, arm64)      |
| Linux   | `.AppImage` (x64, arm64) |

#### macOS Gatekeeper 경고 해결

코드 서명이 없어 첫 실행 시 경고가 나타날 수 있습니다.

1. 시스템 설정 > 개인정보 보호 및 보안으로 이동
2. **"확인되지 않은 Tomato Mien 허용"** 클릭

### 직접 빌드

```bash
npm install
npm run build
npm run electron:build
```

## 프로젝트 구조

npm workspaces 기반 모노레포:

```
packages/
  design-tokens/   # CSS 디자인 토큰 (@tomato-mien/design-tokens)
  ui/              # 공용 React UI 컴포넌트 (@tomato-mien/ui)
  docs/            # 랜딩 페이지 (@tomato-mien/docs)
src/               # Electron 렌더러 (React SPA)
electron/          # Electron 메인/프리로드
```

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

## 기술 스택

| 영역       | 기술                                     |
| ---------- | ---------------------------------------- |
| Frontend   | React 19, TypeScript, Tailwind CSS v4    |
| Desktop    | Electron, electron-builder               |
| State      | Jotai (atomWithStorage)                  |
| Schema     | Zod                                      |
| Storage    | Dexie (IndexedDB)                        |
| Background | Web Worker API                           |
| Build      | Vite, npm workspaces                     |
| Test       | Vitest, Testing Library                  |
| CI/CD      | GitHub Actions (빌드/릴리스, Pages 배포) |

## 기여

이슈 및 PR은 언제나 환영합니다.
