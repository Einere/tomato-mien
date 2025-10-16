# Tomato Mien 🍅🍜

Simple rule-based alarm app

## 기능

- **여러 규칙들을 지원**: 원하는 만큼 알람 규칙들을 만들어서 활성화하거나 비활성화하세요.
- **유연한 커스터마이징**: 원하는 대로 자유롭게 알람 조건을 설정할 수 있습니다.
- **간단한 조건들**: 특정 시간 내 조건, 일정 시간 간격 조건, 정확한 시간 조건을 지원합니다.
- **인터넷 연결 불필요**: 인터넷에 연결되어 있지 않아도 앱을 사용할 수 있습니다.
- **백그라운드 실행**: 앱이 숨겨져 있거나 비활성화 상태여도 알람이 작동합니다.
- **크로스 플랫폼**: macOS, Windows, Linux 지원합니다.

## 다운로드

### macOS
- [Apple Silicon (M1/M2/M3)](https://github.com/Einere/tomato-mien/releases/latest/download/Tomato-Mien-1.0.0-arm64.dmg)
- [Intel Mac](https://github.com/Einere/tomato-mien/releases/latest/download/Tomato-Mien-1.0.0.dmg)

### Windows
- [Windows 64-bit](https://github.com/Einere/tomato-mien/releases/latest/download/Tomato-Mien-Setup-1.0.0.exe)

### Linux
- [AppImage 64-bit](https://github.com/Einere/tomato-mien/releases/latest/download/Tomato-Mien-1.0.0.AppImage)
- [AppImage ARM64](https://github.com/Einere/tomato-mien/releases/latest/download/Tomato-Mien-1.0.0-arm64.AppImage)

## 사용법

1. 앱을 실행합니다.
2. 좌측 패널에서 "새 규칙" 버튼을 클릭하여 알람 규칙을 생성합니다.
3. 우측 패널에서 알람 조건을 설정합니다.
   - 시간 범위: 특정 시간대 설정 (예: 9시-18시)
   - 간격: 일정한 간격으로 알람 (예: 15분마다)
   - 특정 시간: 정확한 시간에 알람 (예: 14시 25분)
4. 조건 그룹을 이용해 복잡한 조건을 구성할 수 있습니다.
5. 규칙을 활성화하면 백그라운드에서 자동으로 알람이 울립니다.

## 개발

### 요구사항
- Node.js 18+
- npm

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# Electron 개발 모드
npm run electron:dev

# 프로덕션 빌드
npm run build

# 배포용 패키지 생성
npm run electron:dist
```

## 기술 스택

- **Frontend**: React, TypeScript, Tailwind CSS
- **Desktop**: Electron
- **Build**: Vite, electron-builder
- **Background Processing**: Web Workers API

## 라이선스

MIT License

## 기여

이슈나 풀 리퀘스트를 환영합니다!

## 자동 업데이트

이 앱은 GitHub Releases를 통해 자동 업데이트를 지원합니다. 새 버전이 출시되면 앱에서 자동으로 알림을 받을 수 있습니다.