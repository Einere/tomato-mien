import type { TimeCondition, CompoundCondition } from '../types/alarm'

/**
 * 조건이 복합 조건(CompoundCondition)인지 확인하는 타입 가드 함수
 * @param condition 확인할 조건
 * @returns condition이 CompoundCondition인지 여부
 */
export function isCompoundCondition(condition: TimeCondition | CompoundCondition): condition is CompoundCondition {
  return 'operator' in condition
}

/**
 * 조건이 단일 시간 조건(TimeCondition)인지 확인하는 타입 가드 함수
 * @param condition 확인할 조건
 * @returns condition이 TimeCondition인지 여부
 */
export function isTimeCondition(condition: TimeCondition | CompoundCondition): condition is TimeCondition {
  return !('operator' in condition)
}
