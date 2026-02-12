# 좋은 코드를 위한 4가지 기준

> 출처: [Frontend Fundamentals - 좋은 코드를 위한 4가지 기준](https://frontend-fundamentals.com/code-quality/code/)

좋은 프론트엔드 코드란 **"변경하기 쉬운 코드"** 이다. 새로운 요구사항 구현 시 기존 코드 수정과 배포가 수월한 코드가 목표이다.

---

## 1. 가독성 (Readability)

코드가 읽기 쉬운 정도. 코드 변경 전 동작 이해가 필수이며, 읽는 사람이 **한 번에 고려하는 맥락을 최소화**하는 것이 핵심이다.

### 규칙

- **같이 실행되지 않는 코드 분리**: 분기에 따라 다른 로직이 하나의 함수/컴포넌트에 혼재하면 안 된다. 각 분기를 별도 함수/컴포넌트로 분리한다.
- **구현 상세 추상화**: 저수준 구현 상세는 별도 함수로 추출하여, 호출부에서는 "무엇을 하는지"만 보이게 한다.
- **복잡한 조건에 이름 붙이기**: `if (a && b || c)` 같은 조건은 의미를 설명하는 변수명으로 추출한다.
- **매직 넘버를 상수로 변환**: 숫자 리터럴에는 의도를 설명하는 이름을 붙인다. (예: `300` → `ANIMATION_DELAY_MS`)
- **시점 이동 최소화**: 위에서 아래로 자연스럽게 읽히도록 구성한다.
- **삼항 연산자 단순화**: 중첩된 삼항 연산자는 if/else나 별도 함수로 분리한다.

### 위반 예시

```typescript
// BAD: 같이 실행되지 않는 코드가 혼재
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  useEffect(() => {
    if (isViewer) return;
    showAnimation();
  }, [isViewer]);
  return isViewer ? <TextButton disabled>Submit</TextButton> : <Button type="submit">Submit</Button>;
}

// GOOD: 분기별 분리
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}
```

---

## 2. 예측 가능성 (Predictability)

함수나 컴포넌트의 **이름, 파라미터, 반환값만으로 동작을 예측**할 수 있는 정도.

### 규칙

- **이름과 동작의 일치**: 함수명이 암시하는 범위 이상의 부수효과(side effect)를 숨기지 않는다. (예: `fetchBalance()`에 로깅을 넣지 않는다.)
- **유사 함수의 반환 타입 통일**: 같은 역할의 함수들은 일관된 반환 타입을 사용한다.
- **이름 중복 방지**: 같은 스코프 내에서 비슷한 이름의 변수/함수가 다른 의미로 사용되지 않게 한다.
- **숨은 로직 제거**: 함수 시그니처에서 예측 불가능한 부수효과는 호출처로 이동시킨다.

### 위반 예시

```typescript
// BAD: 숨은 로직 (이름은 fetch인데 logging도 수행)
async function fetchBalance(): Promise<number> {
  const balance = await http.get<number>("...");
  logging.log("balance_fetched");  // 숨은 부수효과
  return balance;
}

// GOOD: 부수효과를 호출처로 이동
async function fetchBalance(): Promise<number> {
  return await http.get<number>("...");
}
// 호출처에서 명시적으로 로깅
const balance = await fetchBalance();
logging.log("balance_fetched");
```

---

## 3. 응집도 (Cohesion)

수정되어야 할 코드가 **항상 같이 수정되는지** 여부. 높은 응집도는 한 부분 수정 시 의도치 않은 오류를 방지한다.

### 규칙

- **함께 수정되는 코드를 같은 위치에**: 함께 변경되는 파일/함수는 같은 디렉토리나 모듈에 배치한다.
- **매직 넘버 제거로 응집도 향상**: 관련 상수를 한 곳에 모아 관리한다.
- **폼의 응집도**: 폼 필드와 검증 로직은 같은 모듈에 배치한다.

### 가독성과의 트레이드오프

- **위험성 높은 코드** (결제, 인증 등): 응집도 우선 → 공통화/추상화
- **위험성 낮은 코드** (UI 표시 등): 가독성 우선 → 코드 중복 허용

---

## 4. 결합도 (Coupling)

코드 수정 시의 **영향 범위**. 영향 범위가 적고 예측 가능한 코드가 수정하기 쉬운 코드이다.

### 규칙

- **책임을 개별 관리**: 여러 관심사를 하나의 함수/훅에 모으지 않고, 각각 별도로 관리한다.
- **과도한 공통화 금지**: 결합도를 낮추기 위해 오히려 중복 코드를 허용할 수 있다.
- **Props Drilling 개선**: 깊은 props 전달은 Context, 합성(composition) 등으로 해결한다.

### 위반 예시

```typescript
// BAD: 하나의 훅이 모든 쿼리 파라미터를 관리 (높은 결합도)
function usePageState() {
  const [cardId] = useQueryParam("cardId");
  const [filter] = useQueryParam("filter");
  const [sort] = useQueryParam("sort");
  return { cardId, filter, sort };
}

// GOOD: 각 파라미터별 독립 훅 (낮은 결합도)
function useCardIdParam() { return useQueryParam("cardId"); }
function useFilterParam() { return useQueryParam("filter"); }
function useSortParam() { return useQueryParam("sort"); }
```

---

## 4가지 기준의 균형

모든 기준을 동시에 충족하기 어려운 경우가 있다:

| 선택 | 결과 |
|------|------|
| 공통화로 응집도 ↑ | 가독성 ↓, 결합도 ↑ |
| 중복 허용으로 결합도 ↓ | 응집도 ↓ |

현재 상황을 분석하여 **장기적으로 수정 용이성을 높일 기준을 우선순위화**한다.
