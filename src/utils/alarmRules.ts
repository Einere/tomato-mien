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

// 조건 라벨 생성 함수
export const getConditionLabel = (condition: RangeCondition | IntervalCondition | SpecificCondition): string => {
  switch (condition.type) {
    case 'range':
      return `${condition.startHour.toString().padStart(2, '0')}:${condition.startMinute.toString().padStart(2, '0')} - ${condition.endHour.toString().padStart(2, '0')}:${condition.endMinute.toString().padStart(2, '0')}`
    case 'interval':
      return `매 ${condition.intervalMinutes}분마다`
    case 'specific':
      const hour = condition.hour !== undefined ? `${condition.hour.toString().padStart(2, '0')}시` : '모든 시간'
      const minute = condition.minute !== undefined ? `${condition.minute.toString().padStart(2, '0')}분` : '모든 분'
      return `${hour} ${minute}`
  }
}

// 연산자 라벨 생성 함수
export const getOperatorLabel = (operator: LogicalOperator): string => {
  return operator === 'AND' ? '그리고' : '또는'
}
