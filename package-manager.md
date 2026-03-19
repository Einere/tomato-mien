# 패키지 매니저: npm vs pnpm

## 결론

이 프로젝트는 **npm 유지를 권장**합니다.

---

## pnpm 전환 시 추가 작업

1. **`pnpm-workspace.yaml` 생성** — `package.json`의 `workspaces` 필드 제거 필요
2. **스크립트 변경** — `npm run dev -w @tomato-mien/docs` → `pnpm run --filter @tomato-mien/docs dev`
3. **Electron + electron-builder 호환성 이슈** — pnpm의 symlink 방식(`node_modules/.pnpm/`)이 electron-builder의 파일 패키징과 충돌 가능. `shamefully-hoist=true` 설정이 필요한 경우 많음
4. **GitHub Actions 수정** — CI에서 pnpm setup 추가 필요
5. **`npm version`** (`release` 스크립트) → pnpm 동등 명령으로 교체

---

## Electron과 pnpm의 구조적 마찰

### 핵심 원인: pnpm의 non-hoisting 방식

pnpm은 기본적으로 의존성을 `node_modules` 루트에 올리지 않고 `.pnpm/` 하위 symlink 구조로 격리합니다.

```
node_modules/
  .pnpm/
    electron@38.0.0/node_modules/electron/
  electron -> .pnpm/electron@.../  ← symlink
```

Electron 생태계 도구들이 이 구조에서 문제를 일으킵니다.

### electron-builder

- 패키징 시 `node_modules`를 직접 스캔하는데, symlink를 따라가다 경로 해석 실패
- native module 재빌드(`electron-rebuild`) 시 경로 문제
- 해결책: `.npmrc`에 `shamefully-hoist=true` 추가 → pnpm을 쓰는 의미가 퇴색

### native addon (node-gyp)

- `better-sqlite3`, `sharp` 등 native addon은 실제 경로를 기대하는데 symlink로 꼬임
- Electron에서 native addon을 쓸 때 특히 자주 발생

---

## pnpm의 이점

- 디스크 공간 절약 (hard link 기반)
- 더 빠른 설치 속도
- strict한 의존성 격리

---

## 비교 요약

| | npm | pnpm |
|---|---|---|
| Electron 호환성 | 기본 동작 | 추가 설정 필요 |
| native addon | 문제 없음 | 경로 이슈 가능 |
| electron-builder | 문제 없음 | `shamefully-hoist` 필요한 경우 많음 |
| 생태계 지원 | 공식 문서 기준 | 비공식 우회 방법 |

> pnpm이 Electron과 완전히 안 맞는 건 아니지만, "추가 설정 없이는 잘 안 맞고, 설정하면 pnpm 장점이 줄어드는" 구조입니다.
> 실제로 Vite, VS Code Extension 등 대형 Electron 기반 프로젝트 중 pnpm을 쓰는 경우도 있으나, 대부분 `shamefully-hoist=true`나 `.pnpmfile.cjs`로 우회합니다.

---

## 이 프로젝트에서 npm을 유지하는 이유

- `packages/*` 하위 패키지 수가 적어 pnpm의 디스크 절약 효과가 크지 않음
- Electron 빌드 파이프라인(electron-builder, MAS 빌드 등)이 복잡하게 얽혀 있어 마이그레이션 리스크가 이점보다 큼
- pnpm을 꼭 써야 하는 강한 이유(수십 개 패키지, 대규모 모노레포 확장 등)가 없음
