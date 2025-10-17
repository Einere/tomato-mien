# Tomato Mien 🍅🍜

가벼운 규칙 기반 알리미 앱

# 설치 및 실행 

## 앱 내려받기

[Release](https://github.com/Einere/tomato-mien/releases) 에서 최신 버전을 받아주세요.

### 🍎 macOS에서 실행 시 Gatekeeper 경고 해결 방법

Tomato Mien은 무료 오픈소스 앱으로 코드 서명이 없어 첫 실행 시 경고가 나타납니다.

1. 시스템 설정 > 개인정보 보호 및 보안으로 이동
2. "확인되지 않은 개발자" 영역에서 **"확인되지 않은 Tomato Mien 허용"** 클릭

> 💡 애플 개발자 멤버쉽 너무 비싸요... 🤑


## 직접 빌드

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# Electron 앱 빌드
npm run electron:build
```

# 기능

- 조건 기반 알림 설정
- 시간 범위, 간격, 특정 시간 조건 지원
- AND/OR 논리 연산자 지원
- 백그라운드 알림
- 네트워크 연결 불필요

# 기술 스택

- FE: React, TypeScript, Tailwind, Electron
- Build: Vite, electron-builder
- Background: Web Worker API

# 기여

이슈 및 PR은 언제나 환영입니다.