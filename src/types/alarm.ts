// 범위 조건
export interface RangeCondition {
  type: 'range';
  startHour: number; // 0-23
  startMinute: number; // 0-59
  endHour: number; // 0-23
  endMinute: number; // 0-59
}

// 간격 조건
export interface IntervalCondition {
  type: 'interval';
  intervalMinutes: number; // 분 단위 간격
}

// 특정 값 조건
export interface SpecificCondition {
  type: 'specific';
  hour?: number; // 0-23 (undefined면 모든 시간)
  minute?: number; // 0-59 (undefined면 모든 분)
}

export type TimeCondition =
  | RangeCondition
  | IntervalCondition
  | SpecificCondition;

// 논리 연산자
export type LogicalOperator = 'AND' | 'OR';

// 복합 조건 (AND/OR 논리)
export interface CompoundCondition {
  operator: LogicalOperator;
  conditions: (TimeCondition | CompoundCondition)[];
}

// 알람 규칙 집합
export interface AlarmRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: TimeCondition | CompoundCondition;
  createdAt: Date;
  updatedAt: Date;
  isCritical?: boolean;
  soundName?: string;
}

// 알람 설정 저장소 인터페이스
export interface AlarmStorage {
  rules: AlarmRule[];
  lastCheck: Date;
}

// 알람 이벤트
export interface AlarmEvent {
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  message?: string;
}

// 시간 형식
export type TimeFormat = '12h' | '24h';

// 앱 설정
export interface AppSettings {
  timeFormat: TimeFormat;
}
