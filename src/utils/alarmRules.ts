import type {
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
  CompoundCondition,
  LogicalOperator,
} from '../types/alarm'

// 기본 조건 생성 함수들
export const createDefaultRange = (): RangeCondition => ({
  type: 'range',
  startHour: 9,
  startMinute: 0,
  endHour: 17,
  endMinute: 0,
})

export const createDefaultInterval = (): IntervalCondition => ({
  type: 'interval',
  intervalMinutes: 15,
})

export const createDefaultSpecific = (): SpecificCondition => ({
  type: 'specific',
  hour: 14,
  minute: 30,
})

export const createDefaultCompound = (operator: LogicalOperator = 'AND'): CompoundCondition => ({
  operator,
  conditions: [createDefaultRange()],
})

// 조건 타입 변경 함수
export const createConditionByType = (type: 'range' | 'interval' | 'specific'): RangeCondition | IntervalCondition | SpecificCondition => {
  switch (type) {
    case 'range':
      return createDefaultRange()
    case 'interval':
      return createDefaultInterval()
    case 'specific':
      return createDefaultSpecific()
  }
}

// 연산자 라벨 생성 함수
export const getOperatorLabel = (operator: LogicalOperator): string => {
  return operator === 'AND' ? '그리고' : '또는'
}
