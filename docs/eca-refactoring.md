# Composite Pattern에서 ECA 패턴으로: 알람 규칙 엔진 리팩토링

> Tomato Mien 프로젝트에서 알람 조건 평가 엔진을 Composite Pattern에서 ECA(Event-Condition-Action) 패턴으로 전환한 과정을 정리한다.

---

## 목차

1. [프로젝트 배경](#1-프로젝트-배경)
2. [문제 발견: Range + OR = 매분 알람](#2-문제-발견-range--or--매분-알람)
3. [근본 원인 분석](#3-근본-원인-분석)
4. [해결 방안: ECA 패턴](#4-해결-방안-eca-패턴)
5. [구현 상세](#5-구현-상세)
6. [DB 마이그레이션 전략](#6-db-마이그레이션-전략)
7. [UI 변경](#7-ui-변경)
8. [테스트 전략](#8-테스트-전략)
9. [삭제된 코드](#9-삭제된-코드)
10. [개선 효과 요약](#10-개선-효과-요약)
11. [회고: 배운 점](#11-회고-배운-점)

---

## 1. 프로젝트 배경

Tomato Mien은 규칙 기반 알림 데스크톱 앱이다. 사용자가 알람 규칙(AlarmRule)을 생성하면, Web Worker가 매분 조건을 평가하여 일치하면 브라우저 Notification과 사운드를 재생한다.

### 기술 스택

| 영역       | 기술                            |
| ---------- | ------------------------------- |
| 프레임워크 | Electron + React 19 + Vite      |
| 상태 관리  | Jotai (atomWithStorage)         |
| 스키마     | Zod (Single Source of Truth)    |
| DB         | Dexie.js (IndexedDB)            |
| 백그라운드 | Web Worker (1분 간격 평가)      |
| 테스트     | Vitest + @testing-library/react |

### 기존 도메인 모델: Composite Pattern

알람 규칙의 조건은 Composite Pattern으로 설계되었다. GoF 디자인 패턴 중 하나인 Composite는 트리 구조를 표현하는 데 적합하며, 재귀적으로 복합 조건을 구성할 수 있다.

```
AlarmRule
  └── condition: TimeCondition | CompoundCondition
        ├── RangeCondition    — 시간 범위 필터 (09:00~17:00)
        ├── IntervalCondition — 간격 트리거 (매 15분)
        ├── SpecificCondition — 특정 시각 트리거 (14:30)
        └── CompoundCondition — AND/OR 연산자로 중첩 가능
              ├── operator: "AND" | "OR"
              └── conditions: (TimeCondition | CompoundCondition)[]
```

이 설계는 유연했다. 사용자는 AND/OR 연산자를 조합하여 복잡한 조건 트리를 만들 수 있었다.

#### 기존 스키마 (변경 전)

```typescript
// src/schemas/alarm.ts (변경 전)

export const LogicalOperatorSchema = z.enum(["AND", "OR"]);

// CompoundCondition은 재귀 구조이므로 수동 타입 선언 필요
export interface CompoundCondition {
  operator: LogicalOperator;
  conditions: (TimeCondition | CompoundCondition)[];
}

export const CompoundConditionSchema: z.ZodType<CompoundCondition> = z.lazy(
  () =>
    z.object({
      operator: LogicalOperatorSchema,
      conditions: z
        .array(z.union([TimeConditionSchema, CompoundConditionSchema]))
        .min(1),
    }),
);

export const AnyConditionSchema = z.lazy(() =>
  z.union([TimeConditionSchema, CompoundConditionSchema]),
);

export const AlarmRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  condition: AnyConditionSchema, // ← 단일 condition 필드
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  notificationEnabled: z.boolean().default(true),
});
```

#### 기존 평가 엔진 (변경 전)

```typescript
// src/utils/evaluateCondition.ts (변경 전)

export function evaluateCondition(
  condition: TimeCondition | CompoundCondition,
  currentHour: number,
  currentMinute: number,
): boolean {
  if (isCompoundCondition(condition)) {
    return evaluateCompoundCondition(condition, currentHour, currentMinute);
  }
  switch (condition.type) {
    case "range": return evaluateRangeCondition(condition, ...);
    case "interval": return evaluateIntervalCondition(condition, ...);
    case "specific": return evaluateSpecificCondition(condition, ...);
  }
}

function evaluateCompoundCondition(
  condition: CompoundCondition,
  currentHour: number,
  currentMinute: number,
): boolean {
  const results = condition.conditions.map(c =>
    evaluateCondition(c, currentHour, currentMinute)
  );
  return condition.operator === "AND"
    ? results.every(Boolean)
    : results.some(Boolean);
}
```

---

## 2. 문제 발견: Range + OR = 매분 알람

### 증상

사용자가 다음과 같은 규칙을 생성하면:

```
OR
  ├── Range: 09:00 ~ 17:00
  └── Interval: 매 15분
```

**기대 동작**: 09:00~17:00 시간대에만 15분 간격으로 알람 발동
**실제 동작**: 09:00~17:00 동안 **매분** 알람 발동

### 원인: Range는 필터인데 트리거로 평가

`evaluateCompoundCondition`에서 OR 연산자는 `results.some(Boolean)`으로 평가한다.

| 시각  | Range (09:00~17:00) | Interval (매 15분) | OR 결과                   |
| ----- | ------------------- | ------------------ | ------------------------- |
| 09:00 | `true`              | `true`             | `true`                    |
| 09:01 | `true`              | `false`            | **`true`** (Range가 true) |
| 09:02 | `true`              | `false`            | **`true`** (Range가 true) |
| 09:15 | `true`              | `true`             | `true`                    |

Range 조건이 범위 내 모든 분에 대해 `true`를 반환하므로, OR에서는 Interval의 결과와 무관하게 항상 `true`가 된다.

### 근본적 질문

이 버그는 단순히 "OR 대신 AND를 쓰면 해결되지 않을까?" 하는 생각이 들 수 있다. 실제로 AND로 변경하면:

| 시각  | Range (09:00~17:00) | Interval (매 15분) | AND 결과 |
| ----- | ------------------- | ------------------ | -------- |
| 09:00 | `true`              | `true`             | `true`   |
| 09:01 | `true`              | `false`            | `false`  |
| 09:15 | `true`              | `true`             | `true`   |

AND로는 정상 동작한다. 하지만 문제는 **사용자가 OR을 선택할 수 있다**는 것이다. UI에서 AND/OR 토글이 제공되므로, 사용자가 의도치 않게 잘못된 조합을 만들 수 있다.

---

## 3. 근본 원인 분석

### 의미론적 불일치 (Semantic Mismatch)

Composite Pattern의 근본적 문제는 **서로 다른 의미론(semantics)을 가진 조건을 동일한 boolean으로 취급**한다는 것이다.

| 조건 타입           | 실제 역할            | 의미                        |
| ------------------- | -------------------- | --------------------------- |
| `IntervalCondition` | **트리거** (Event)   | "이 시점에 알람을 발동하라" |
| `SpecificCondition` | **트리거** (Event)   | "이 시점에 알람을 발동하라" |
| `RangeCondition`    | **필터** (Condition) | "이 시간대에만 허용하라"    |

트리거는 "언제 발동할지"를 정의하고, 필터는 "언제 허용할지"를 정의한다. 이 두 가지는 본질적으로 다른 역할인데, Composite Pattern에서는 둘 다 `boolean`을 반환하는 노드로 취급된다.

### 타입 시스템의 한계

기존 타입 시스템에서는 이 의미론적 차이를 표현할 방법이 없었다:

```typescript
// CompoundCondition.conditions에 Range와 Interval이 혼재
type AnyCondition = TimeCondition | CompoundCondition;
// TimeCondition = RangeCondition | IntervalCondition | SpecificCondition
// → 어떤 조건이 트리거이고 어떤 조건이 필터인지 타입으로 구분 불가
```

### 이론적 배경: ECA 패턴

ECA(Event-Condition-Action)는 이벤트 기반 시스템에서 널리 사용되는 패턴이다:

```
Event:     "무엇이 트리거를 발동시키는가" (interval, specific time)
Condition: "트리거가 발동되었을 때, 실제로 실행해도 되는가" (time range)
Action:    "알람 발동" (notification + sound)
```

- **Event (트리거)**: OR 결합. 하나라도 발동하면 알람 후보.
- **Condition (필터)**: AND 결합. 모두 통과해야 알람 실행.
- **Action**: 트리거 발동 + 필터 통과 시 실행.

이 패턴은 Active Database, CEP(Complex Event Processing), IoT 규칙 엔진 등에서 업계 표준으로 사용된다.

---

## 4. 해결 방안: ECA 패턴

### 핵심 설계

```
변경 전: rule.condition = CompoundCondition { operator: AND, conditions: [Range, Interval] }
변경 후: rule.triggers = [IntervalCondition]    ← OR 결합 (하나라도 발동하면 알람)
         rule.filters  = [RangeCondition]       ← AND 결합 (모두 통과해야 알람)
```

### 타입 시스템으로 강제

```typescript
// 변경 후 스키마
export const TriggerConditionSchema = z.union([
  IntervalConditionSchema,
  SpecificConditionSchema,
]);

export const FilterConditionSchema = RangeConditionSchema;

export const AlarmRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  triggers: z.array(TriggerConditionSchema).min(1), // 최소 1개 필수
  filters: z.array(FilterConditionSchema).default([]), // 0개 허용
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  notificationEnabled: z.boolean().default(true),
});
```

이제 `RangeCondition`은 `triggers`에 넣을 수 없고, `IntervalCondition`은 `filters`에 넣을 수 없다. **타입 시스템이 잘못된 조합을 컴파일 타임에 차단**한다.

### 평가 로직

```typescript
// 변경 후 evaluateRule
export function evaluateRule(
  triggers: TriggerCondition[],
  filters: FilterCondition[],
  currentHour: number,
  currentMinute: number,
): boolean {
  // 1. 필터 AND: 모든 필터를 통과해야 함
  const filtersPass = filters.every(f =>
    evaluateCondition(f, currentHour, currentMinute),
  );
  if (!filtersPass) return false;

  // 2. 트리거 OR: 하나라도 발동하면 알람
  return triggers.some(t => evaluateCondition(t, currentHour, currentMinute));
}
```

이 구조에서 앞서 문제였던 시나리오는:

```
triggers: [{ type: "interval", intervalMinutes: 15 }]
filters:  [{ type: "range", startHour: 9, ..., endHour: 17, ... }]
```

| 시각  | Filter (09:00~17:00) | Trigger (매 15분) | 결과    |
| ----- | -------------------- | ----------------- | ------- |
| 09:00 | `true` (통과)        | `true` (발동)     | `true`  |
| 09:01 | `true` (통과)        | `false` (미발동)  | `false` |
| 09:15 | `true` (통과)        | `true` (발동)     | `true`  |
| 08:00 | `false` (차단)       | - (평가하지 않음) | `false` |

필터가 먼저 평가되고, 통과한 경우에만 트리거를 평가한다. 필터 실패 시 조기 반환(early return)으로 불필요한 트리거 평가를 건너뛴다.

---

## 5. 구현 상세

### 5.1 Phase 1: 스키마 & 타입 (SSOT)

Zod 스키마가 Single Source of Truth이므로 모든 변경의 시작점이다.

#### `src/schemas/alarm.ts`

**삭제한 것:**

- `LogicalOperatorSchema` (`z.enum(["AND", "OR"])`)
- `CompoundCondition` 수동 타입 선언 (interface)
- `CompoundConditionSchema` (`z.lazy()` 재귀 스키마)
- `AnyConditionSchema` (`z.union([TimeCondition, CompoundCondition])`)
- `AlarmRuleSchema.refine()` (Range 시간 역전 검증 — `RangeConditionSchema.refine()`에 이미 포함)

**추가한 것:**

- `TriggerConditionSchema` = `z.union([IntervalConditionSchema, SpecificConditionSchema])`
- `FilterConditionSchema` = `RangeConditionSchema`
- `TriggerCondition` 타입 (z.infer)
- `FilterCondition` 타입 (z.infer)

**변경한 것:**

- `AlarmRuleSchema.condition: AnyConditionSchema` → `triggers: z.array(TriggerConditionSchema).min(1)` + `filters: z.array(FilterConditionSchema).default([])`

#### `src/types/alarm.ts` (배럴 파일)

```typescript
// 변경 후
export type {
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
  TimeCondition,
  TriggerCondition, // 추가
  FilterCondition, // 추가
  AlarmRule,
  AlarmStorage,
  AlarmEvent,
  TimeFormat,
  Theme,
  AppSettings,
} from "@/schemas/alarm";
// 삭제: LogicalOperator, CompoundCondition, AnyCondition
```

### 5.2 Phase 2: 평가 로직

#### `src/utils/evaluateCondition.ts`

**삭제한 것:**

- `hasTriggerCondition(condition)` — CompoundCondition 트리를 재귀 순회하여 interval/specific 존재 확인. Worker에서 알람 발동 전 "트리거가 있는 규칙인지" 판별하는 데 사용했지만, 새 스키마에서는 `triggers.min(1)`으로 보장.
- `evaluateCompoundCondition(condition, h, m)` — AND/OR 재귀 평가.
- `isCompoundCondition()` 타입 가드 import.

**추가한 것:**

- `evaluateRule(triggers, filters, currentHour, currentMinute)` — filters AND → triggers OR.

**변경한 것:**

- `evaluateCondition()` 함수 시그니처: `TimeCondition | CompoundCondition` → `TimeCondition`만 받도록 축소. CompoundCondition 분기 완전 제거.

#### `src/utils/typeGuards.ts` — 파일 삭제

```typescript
// 삭제된 전체 파일 내용:
import type { CompoundCondition, TimeCondition } from "@/types/alarm";

export function isCompoundCondition(
  condition: TimeCondition | CompoundCondition,
): condition is CompoundCondition {
  return "operator" in condition;
}

export function isTimeCondition(
  condition: TimeCondition | CompoundCondition,
): condition is TimeCondition {
  return !("operator" in condition);
}
```

CompoundCondition이 사라지면서 타입 가드 자체가 불필요해졌다. discriminated union의 `type` 필드로 직접 분기하면 되므로 런타임 타입 가드가 필요 없다.

#### `src/utils/condition.ts`

**삭제한 것:**

- `describeCondition()`의 CompoundCondition 재귀 분기 (AND/OR 접속사 포함 설명 생성)
- `AnyCondition`, `AnyConditionSchema` import

**추가한 것:**

- `describeRule(triggers, filters, timeFormat)`:
  ```
  "every 15 minutes"                            — triggers만
  "every 15 minutes or at 14:30"                — 여러 triggers
  "every 15 minutes (from 09:00 to 17:00)"      — triggers + filters
  ```
- `validateRule(triggers, filters)`:
  - triggers 빈 배열 검사 → `"At least one trigger is required."`
  - 각 trigger/filter 개별 `validateCondition()` 호출
  - `ValidationIssue.path`가 `"triggers[0].intervalMinutes"`, `"filters[0]"` 형태

**변경한 것:**

- `describeCondition()`: `TimeCondition`만 처리 (CompoundCondition 분기 제거)
- `validateCondition()`: `AnyConditionSchema.safeParse()` → `TimeConditionSchema.safeParse()`

#### `src/utils/alarmRules.ts`

**삭제한 것:**

- `createDefaultCompound(operator: LogicalOperator)` — AND/OR 그룹 생성 팩토리
- `getOperatorLabel(operator: LogicalOperator)` — "AND" → "All of" 변환
- `LogicalOperator`, `CompoundCondition` import

**유지한 것:**

- `createDefaultRange()` — 09:00~17:00
- `createDefaultInterval()` — 매 15분
- `createDefaultSpecific()` — 14:30
- `createConditionByType(type)` — 타입 문자열 → 팩토리 호출

### 5.3 Phase 3: Worker

#### `src/workers/alarmWorker.ts`

```typescript
// 변경 전
import {
  evaluateCondition,
  hasTriggerCondition,
} from "@/utils/evaluateCondition";

// Worker 내부:
if (!hasTriggerCondition(rule.condition)) continue;
const shouldTrigger = evaluateCondition(
  rule.condition,
  currentHour,
  currentMinute,
);

// 변경 후
import { evaluateRule } from "@/utils/evaluateCondition";

// Worker 내부:
const shouldTrigger = evaluateRule(
  rule.triggers,
  rule.filters,
  currentHour,
  currentMinute,
);
```

`hasTriggerCondition()` 사전 검사가 불필요해졌다. 스키마에서 `triggers.min(1)`을 강제하므로, 유효한 규칙이라면 반드시 트리거가 1개 이상 존재한다.

### 5.4 Phase 4: Store

#### `src/store/actions.ts`

```typescript
// 변경 전
import { createDefaultCompound } from "@/utils/alarmRules";

const newRule: AlarmRule = {
  ...
  condition: createDefaultCompound("AND"),
};

// 변경 후
import { createDefaultInterval } from "@/utils/alarmRules";

const newRule: AlarmRule = {
  ...
  triggers: [createDefaultInterval()],
  filters: [],
};
```

---

## 6. DB 마이그레이션 전략

기존 사용자의 데이터를 보존하기 위해 Dexie.js의 버전 업그레이드 메커니즘을 활용했다.

### Dexie 버전 업그레이드

```typescript
// src/db/database.ts

interface LegacyCondition {
  type?: string;
  operator?: string;
  conditions?: LegacyCondition[];
  [key: string]: unknown;
}

function migrateConditionToECA(condition: LegacyCondition): {
  triggers: TriggerCondition[];
  filters: FilterCondition[];
} {
  const triggers: TriggerCondition[] = [];
  const filters: FilterCondition[] = [];

  function walk(cond: LegacyCondition) {
    if (cond.operator && Array.isArray(cond.conditions)) {
      // CompoundCondition: 재귀적으로 자식 순회
      for (const child of cond.conditions) {
        walk(child);
      }
    } else if (cond.type === "range") {
      filters.push(cond as unknown as FilterCondition);
    } else if (cond.type === "interval" || cond.type === "specific") {
      triggers.push(cond as unknown as TriggerCondition);
    }
  }

  walk(condition);

  // 트리거가 하나도 없으면 기본 interval 삽입 (스키마 min(1) 충족)
  if (triggers.length === 0) {
    triggers.push({ type: "interval", intervalMinutes: 60 });
  }

  return { triggers, filters };
}
```

### 마이그레이션 로직의 핵심 포인트

1. **재귀 순회 (tree flattening)**: CompoundCondition이 중첩되어 있을 수 있으므로 재귀적으로 `walk()`. operator/conditions 구조를 만나면 자식으로 들어가고, 리프 노드(type이 있는 노드)를 만나면 역할에 따라 분류.

2. **operator 무시**: 기존 AND/OR 연산자 정보는 버린다. ECA 패턴에서는 트리거는 항상 OR, 필터는 항상 AND이므로 연산자 자체가 불필요.

3. **안전 장치**: 트리거가 0개인 경우(예: Range만 있는 규칙) 기본 interval(60분)을 삽입하여 스키마 무결성을 보장.

4. **Dexie version(2)**: IndexedDB 스토어 스키마(인덱스)는 변경 없이 데이터만 변환. `upgrade()` 콜백에서 `toCollection().modify()`로 각 row를 in-place 수정.

```typescript
this.version(2)
  .stores({
    rules: "id, enabled, updatedAt",
    settings: "id",
    metadata: "key",
  })
  .upgrade(tx => {
    return tx
      .table("rules")
      .toCollection()
      .modify(rule => {
        if ("condition" in rule) {
          const { triggers, filters } = migrateConditionToECA(
            rule.condition as LegacyCondition,
          );
          rule.triggers = triggers;
          rule.filters = filters;
          delete rule.condition;
        }
      });
  });
```

---

## 7. UI 변경

### 7.1 LogicTree: 재귀 트리 → 평면 두 섹션

#### 변경 전: 재귀 구조

```
LogicTree (루트)
  └── ConditionGroup (CompoundCondition, 재귀)
        ├── ConditionGroup (중첩 그룹, 재귀)
        └── ConditionRow (TimeCondition, 리프)
```

- Props: `{ condition: CompoundCondition, onChange }`
- ConditionGroup 컴포넌트가 재귀적으로 자신을 렌더링
- AND/OR 토글 버튼 제공
- "Add Group" 버튼으로 CompoundCondition 중첩 가능

#### 변경 후: 평면 두 섹션

```
LogicTree
  ├── Triggers 섹션
  │     ├── ConditionRow (IntervalCondition)
  │     ├── ConditionRow (SpecificCondition)
  │     └── [+ Interval] [+ Time] 버튼
  └── Filters 섹션
        ├── ConditionRow (RangeCondition)
        └── [+ Range] 버튼
```

- Props: `{ triggers, filters, onTriggersChange, onFiltersChange }`
- 재귀 없음. 각 섹션은 단순한 리스트.
- ConditionRow는 변경 없이 재사용 (이미 TimeCondition만 처리)

#### ConditionGroup.tsx — 삭제

재귀 그룹 UI 컴포넌트가 더 이상 필요 없어 완전 삭제.

### 7.2 EditorView: 상태 분리

```typescript
// 변경 전
const [condition, setCondition] = useState<AnyCondition>(
  createDefaultCompound("AND"),
);

// 변경 후
const [triggers, setTriggers] = useState<TriggerCondition[]>([
  createDefaultInterval(),
]);
const [filters, setFilters] = useState<FilterCondition[]>([]);
```

검증도 변경:

```typescript
// 변경 전
const issues = validateCondition(condition);

// 변경 후
const issues = validateRule(triggers, filters);
```

### 7.3 EditorSummary: Props 변경

```typescript
// 변경 전
interface EditorSummaryProps {
  condition: AnyCondition;
  issues: ValidationIssue[];
}
// describeCondition(condition, timeFormat) 사용

// 변경 후
interface EditorSummaryProps {
  triggers: TriggerCondition[];
  filters: FilterCondition[];
  issues: ValidationIssue[];
}
// describeRule(triggers, filters, timeFormat) 사용
```

### 7.4 RuleCard: 조건 아이콘 & 설명

```typescript
// 변경 전
const description = describeCondition(rule.condition, timeFormat);
const icon = getConditionIcon(rule.condition);
// getConditionIcon: CompoundCondition이면 "account_tree" 아이콘

// 변경 후
const description = describeRule(rule.triggers, rule.filters, timeFormat);
const icon = getConditionIcon(rule.triggers);
// getConditionIcon: 첫 번째 trigger의 type으로 결정
//   interval → "timer", specific → "alarm"
```

---

## 8. 테스트 전략

### 변경된 테스트 파일 (11개)

| 파일                        | 주요 변경                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `evaluateCondition.test.ts` | CompoundCondition/hasTriggerCondition 테스트 삭제, `evaluateRule()` 테스트 추가                                  |
| `condition.test.ts`         | CompoundCondition describe 테스트 삭제, `describeRule()`/`validateRule()` 테스트 추가                            |
| `alarm.test.ts` (스키마)    | CompoundConditionSchema/AnyConditionSchema 테스트 삭제, TriggerConditionSchema/FilterConditionSchema 테스트 추가 |
| `atoms.test.ts`             | createTestRule 팩토리: `condition` → `triggers`/`filters`                                                        |
| `derived.test.ts`           | createTestRule 팩토리: `condition` → `triggers`/`filters`                                                        |
| `storage.test.ts`           | createTestRule 팩토리: `condition` → `triggers`/`filters`                                                        |
| `migration.test.ts`         | createLocalStorageRule 팩토리: `condition` → `triggers`/`filters`                                                |
| `useElectronMenu.test.ts`   | createTestRule 팩토리: `condition` → `triggers`/`filters`                                                        |
| `EditorView.test.tsx`       | createTestRule 팩토리: `condition` → `triggers`/`filters`                                                        |
| `EditorSummary.test.tsx`    | Props: `condition` → `triggers`/`filters`                                                                        |
| `RuleCardList.test.tsx`     | createTestRule 팩토리: `condition` → `triggers`/`filters`                                                        |

### evaluateRule 테스트 케이스

```typescript
describe("evaluateRule", () => {
  it("triggers OR: 하나라도 발동하면 true", () => {
    const triggers = [
      { type: "specific", hour: 9, minute: 0 },
      { type: "specific", hour: 17, minute: 0 },
    ];
    expect(evaluateRule(triggers, [], 9, 0)).toBe(true); // 첫 번째 trigger
    expect(evaluateRule(triggers, [], 17, 0)).toBe(true); // 두 번째 trigger
    expect(evaluateRule(triggers, [], 12, 0)).toBe(false); // 둘 다 아님
  });

  it("filters AND: 하나라도 실패하면 false", () => {
    const triggers = [{ type: "interval", intervalMinutes: 15 }];
    const filters = [
      {
        type: "range",
        startHour: 9,
        startMinute: 0,
        endHour: 12,
        endMinute: 0,
      },
      {
        type: "range",
        startHour: 8,
        startMinute: 0,
        endHour: 10,
        endMinute: 0,
      },
    ];
    // 9:00 — 두 필터 모두 통과 + 15분 간격 발동
    expect(evaluateRule(triggers, filters, 9, 0)).toBe(true);
    // 11:00 — 두 번째 필터(8~10) 불통과
    expect(evaluateRule(triggers, filters, 11, 0)).toBe(false);
  });

  it("filters 빈 배열이면 트리거만으로 평가", () => {
    // filters가 없으면 every()가 true → 트리거만 평가
    expect(
      evaluateRule([{ type: "interval", intervalMinutes: 30 }], [], 0, 0),
    ).toBe(true);
    expect(
      evaluateRule([{ type: "interval", intervalMinutes: 30 }], [], 0, 15),
    ).toBe(false);
  });

  it("filter가 불통과하면 트리거 평가하지 않고 false", () => {
    // 매 1분 interval이어도 범위 밖이면 false
    const triggers = [{ type: "interval", intervalMinutes: 1 }];
    const filters = [
      {
        type: "range",
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      },
    ];
    expect(evaluateRule(triggers, filters, 8, 0)).toBe(false);
  });
});
```

### 테스트 데이터 팩토리 변경

모든 테스트 파일의 `createTestRule` 팩토리를 일괄 변경:

```typescript
// 변경 전
function createTestRule(overrides?: Partial<AlarmRule>): AlarmRule {
  return {
    id: crypto.randomUUID(),
    name: "Test Rule",
    enabled: true,
    condition: { type: "interval", intervalMinutes: 15 },
    createdAt: new Date(),
    updatedAt: new Date(),
    notificationEnabled: true,
    ...overrides,
  };
}

// 변경 후
function createTestRule(overrides?: Partial<AlarmRule>): AlarmRule {
  return {
    id: crypto.randomUUID(),
    name: "Test Rule",
    enabled: true,
    triggers: [{ type: "interval", intervalMinutes: 15 }],
    filters: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    notificationEnabled: true,
    ...overrides,
  };
}
```

### 최종 결과

```
npm run build       → TypeScript 빌드 성공
npx vitest run      → 19 test files, 177 tests passed
npm run lint        → ESLint + Prettier 통과
```

---

## 9. 삭제된 코드

이번 리팩토링에서 제거된 코드를 유형별로 정리한다.

### 삭제된 타입 & 스키마

| 항목                            | 파일                     | 이유                                              |
| ------------------------------- | ------------------------ | ------------------------------------------------- |
| `LogicalOperatorSchema`         | schemas/alarm.ts         | AND/OR 연산자 불필요                              |
| `CompoundCondition` (interface) | schemas/alarm.ts         | 재귀 복합 조건 구조 제거                          |
| `CompoundConditionSchema`       | schemas/alarm.ts         | 재귀 Zod 스키마 제거                              |
| `AnyConditionSchema`            | schemas/alarm.ts         | `TimeCondition \| CompoundCondition` union 불필요 |
| `LogicalOperator` 타입          | types/alarm.ts re-export | 삭제된 스키마의 추론 타입                         |
| `CompoundCondition` 타입        | types/alarm.ts re-export | 삭제된 스키마의 추론 타입                         |
| `AnyCondition` 타입             | types/alarm.ts re-export | 삭제된 스키마의 추론 타입                         |

### 삭제된 함수

| 함수                          | 파일                 | 이유                            |
| ----------------------------- | -------------------- | ------------------------------- |
| `hasTriggerCondition()`       | evaluateCondition.ts | `triggers.min(1)` 스키마로 대체 |
| `evaluateCompoundCondition()` | evaluateCondition.ts | 재귀 AND/OR 평가 불필요         |
| `isCompoundCondition()`       | typeGuards.ts        | CompoundCondition 분기 불필요   |
| `isTimeCondition()`           | typeGuards.ts        | CompoundCondition 분기 불필요   |
| `createDefaultCompound()`     | alarmRules.ts        | AND/OR 그룹 생성 불필요         |
| `getOperatorLabel()`          | alarmRules.ts        | "AND"→"All of" 변환 불필요      |

### 삭제된 파일

| 파일                                       | 이유                                    |
| ------------------------------------------ | --------------------------------------- |
| `src/utils/typeGuards.ts`                  | CompoundCondition 타입 가드 전체 불필요 |
| `src/components/Editor/ConditionGroup.tsx` | 재귀 그룹 UI 컴포넌트 불필요            |

### 삭제된 테스트

| 테스트                               | 파일                      |
| ------------------------------------ | ------------------------- |
| CompoundCondition AND/OR 평가 테스트 | evaluateCondition.test.ts |
| `hasTriggerCondition()` 테스트       | evaluateCondition.test.ts |
| CompoundCondition 설명 생성 테스트   | condition.test.ts         |
| CompoundConditionSchema 검증 테스트  | alarm.test.ts             |
| AnyConditionSchema 검증 테스트       | alarm.test.ts             |

---

## 10. 개선 효과 요약

### 버그 수정

| 시나리오              | 변경 전                            | 변경 후                              |
| --------------------- | ---------------------------------- | ------------------------------------ |
| Range + OR + Interval | 범위 내 매분 알람                  | 불가능한 조합 (타입 에러)            |
| Range만 있는 규칙     | `hasTriggerCondition()`으로 필터링 | `triggers.min(1)` 스키마로 원천 차단 |

### 코드 복잡도 감소

| 지표                      | 변경 전                                                    | 변경 후                                               | 변화        |
| ------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- | ----------- |
| 타입 수 (alarm.ts)        | 12 (LogicalOperator, CompoundCondition, AnyCondition 포함) | 11 (TriggerCondition, FilterCondition 추가, 3개 삭제) | -1          |
| evaluateCondition.ts 분기 | CompoundCondition 재귀 + TimeCondition switch              | TimeCondition switch만                                | 재귀 제거   |
| typeGuards.ts             | 2개 함수                                                   | 파일 삭제                                             | -1 파일     |
| ConditionGroup.tsx        | 재귀 컴포넌트                                              | 삭제                                                  | -1 파일     |
| 팩토리 함수               | 6개                                                        | 4개                                                   | -2          |
| 테스트 수                 | 177개                                                      | 177개                                                 | 동일 (교체) |

### 타입 안전성 향상

```typescript
// 변경 전: 런타임에서만 잡히는 오류
rule.condition = {
  operator: "OR",
  conditions: [
    { type: "range", startHour: 9, ... },    // 필터
    { type: "interval", intervalMinutes: 15 }, // 트리거
  ]
}; // ← 컴파일 성공, 런타임 버그

// 변경 후: 컴파일 타임에 잡히는 오류
rule.triggers = [
  { type: "range", startHour: 9, ... }, // ← TypeScript 에러!
  // Type 'RangeCondition' is not assignable to type 'TriggerCondition'
];
```

### 인지 부하 감소

| 항목               | 변경 전                             | 변경 후                                       |
| ------------------ | ----------------------------------- | --------------------------------------------- |
| 조건 구성 방법     | AND/OR 자유 중첩 → 무한한 조합      | Triggers(OR) + Filters(AND) → 명확한 2개 슬롯 |
| UI 복잡도          | 재귀 트리 (ConditionGroup 중첩)     | 평면 리스트 2개                               |
| 사용자 실수 가능성 | AND/OR 잘못 선택 → 의도치 않은 동작 | 역할별 분리 → 실수 불가                       |

### 아키텍처 개선

```
변경 전:
  Composite Pattern
  ├── 유연함: 무한 중첩 가능
  ├── 복잡함: 타입 가드, 재귀 평가, 재귀 UI
  └── 위험함: 의미론적 혼동 가능

변경 후:
  ECA Pattern
  ├── 제한적: 2-layer (triggers + filters)만 가능
  ├── 단순함: switch문, 평면 리스트
  └── 안전함: 타입 시스템이 역할 분리 보장
```

---

## 11. 회고: 배운 점

### 1. "유연성"이 항상 좋은 것은 아니다

Composite Pattern은 GoF 패턴 중에서도 우아한 패턴이다. 하지만 이 프로젝트에서는 과도한 유연성이 오히려 버그를 유발했다. 사용자에게 AND/OR을 자유롭게 선택하도록 한 것이 실수였다.

**도메인 지식이 코드 구조보다 중요하다.** 알람 시스템에서 "언제 발동하는가"(트리거)와 "언제 허용하는가"(필터)는 본질적으로 다른 개념이다. 이 도메인 지식을 타입 시스템에 반영하는 것이 올바른 설계다.

### 2. 타입 시스템을 활용한 방어적 설계

버그를 런타임 검증으로 잡는 것보다, 컴파일 타임에 원천 차단하는 것이 훨씬 효과적이다. `TriggerConditionSchema`와 `FilterConditionSchema`를 분리함으로써, Range를 트리거 위치에 넣는 것이 아예 불가능해졌다.

> "Make invalid states unrepresentable" — Yaron Minsky

### 3. Zod SSOT의 위력

스키마 하나를 수정하면 TypeScript 컴파일러가 관련된 모든 코드를 찾아준다. Phase 1에서 스키마를 변경하자 Phase 2~7의 모든 변경 지점이 TypeScript 에러로 노출되었다. 이것이 SSOT(Single Source of Truth)의 실질적 가치다.

### 4. 마이그레이션은 설계의 일부다

도메인 모델을 변경할 때 기존 데이터의 마이그레이션을 간과하기 쉽다. Dexie의 `version().upgrade()` 메커니즘을 활용하여 기존 CompoundCondition 트리를 재귀적으로 순회하고 평탄화(flattening)하는 마이그레이션을 구현했다. **데이터 마이그레이션 없는 도메인 모델 변경은 불완전하다.**

### 5. 삭제가 가장 좋은 리팩토링

이번 리팩토링에서 가장 의미 있는 변경은 코드 삭제다. `typeGuards.ts` 파일 삭제, `ConditionGroup.tsx` 삭제, 재귀 평가 로직 삭제. 코드를 추가하는 것보다 코드를 제거하여 복잡도를 줄이는 것이 더 가치 있다.

---

## 변경 파일 목록

| 파일                                                       | 변경 유형                              |
| ---------------------------------------------------------- | -------------------------------------- |
| `src/schemas/alarm.ts`                                     | 수정 (스키마 재설계)                   |
| `src/types/alarm.ts`                                       | 수정 (re-export 변경)                  |
| `src/utils/evaluateCondition.ts`                           | 수정 (evaluateRule 추가, 재귀 제거)    |
| `src/utils/typeGuards.ts`                                  | **삭제**                               |
| `src/utils/condition.ts`                                   | 수정 (describeRule, validateRule 추가) |
| `src/utils/alarmRules.ts`                                  | 수정 (팩토리 정리)                     |
| `src/workers/alarmWorker.ts`                               | 수정 (evaluateRule 사용)               |
| `src/store/actions.ts`                                     | 수정 (triggers/filters 구조)           |
| `src/db/database.ts`                                       | 수정 (version 2 + 마이그레이션)        |
| `src/components/Editor/LogicTree.tsx`                      | 수정 (완전 재설계)                     |
| `src/components/Editor/ConditionGroup.tsx`                 | **삭제**                               |
| `src/components/Editor/EditorView.tsx`                     | 수정 (triggers/filters 상태)           |
| `src/components/Editor/EditorSummary.tsx`                  | 수정 (props 변경)                      |
| `src/components/Dashboard/RuleCard.tsx`                    | 수정 (describeRule 사용)               |
| `src/utils/__tests__/evaluateCondition.test.ts`            | 수정                                   |
| `src/utils/__tests__/condition.test.ts`                    | 수정                                   |
| `src/schemas/__tests__/alarm.test.ts`                      | 수정                                   |
| `src/store/__tests__/atoms.test.ts`                        | 수정                                   |
| `src/store/__tests__/derived.test.ts`                      | 수정                                   |
| `src/db/__tests__/storage.test.ts`                         | 수정                                   |
| `src/db/__tests__/migration.test.ts`                       | 수정                                   |
| `src/hooks/__tests__/useElectronMenu.test.ts`              | 수정                                   |
| `src/components/__tests__/EditorView.test.tsx`             | 수정                                   |
| `src/components/__tests__/EditorSummary.test.tsx`          | 수정                                   |
| `src/components/Dashboard/__tests__/RuleCardList.test.tsx` | 수정                                   |
