import type { TimeCondition, CompoundCondition } from '../types/alarm'

export type AnyCondition = TimeCondition | CompoundCondition

export interface ValidationIssue {
  path: string // e.g., conditions[1].startHour
  message: string
}

export function describeCondition(cond: AnyCondition): string {
  if ('operator' in cond) {
    const childTexts = cond.conditions.map((c) => describeCondition(c))
    const joined = childTexts.join(` ${cond.operator} `)
    return childTexts.length > 1 ? `(${joined})` : joined
  }

  switch (cond.type) {
    case 'range':
      return `${pad2(cond.startHour)}:${pad2(cond.startMinute)}–${pad2(cond.endHour)}:${pad2(cond.endMinute)}`
    case 'interval':
      return `매 ${cond.intervalMinutes}분`
    case 'specific': {
      const h = cond.hour !== undefined ? `${pad2(cond.hour)}시` : '모든 시간'
      const m = cond.minute !== undefined ? `${pad2(cond.minute)}분` : '모든 분'
      return `${h} ${m}`
    }
  }
}

export function validateCondition(cond: AnyCondition, basePath = 'condition'): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if ('operator' in cond) {
    if (cond.conditions.length === 0) {
      issues.push({ path: basePath, message: '그룹 안에 최소 1개의 조건이 필요합니다.' })
    }
    cond.conditions.forEach((c, idx) => {
      issues.push(...validateCondition(c, `${basePath}.conditions[${idx}]`))
    })
    return issues
  }

  // TODO: 조건 타입 별 검증 로직을 별도의 함수로 분리해내기
  if (cond.type === 'range') {
    const start = cond.startHour * 60 + cond.startMinute
    const end = cond.endHour * 60 + cond.endMinute
    if (start > end) {
      issues.push({ path: basePath, message: '시작 시간이 종료 시간보다 늦습니다.' })
    }
  }

  if (cond.type === 'interval') {
    if (!Number.isFinite(cond.intervalMinutes) || cond.intervalMinutes <= 0) {
      issues.push({ path: basePath, message: '간격은 1분 이상이어야 합니다.' })
    }
    if (cond.intervalMinutes > 720) {
      issues.push({ path: basePath, message: '간격이 너무 깁니다 (최대 720분 권장).' })
    }
  }

  if (cond.type === 'specific') {
    if (cond.hour !== undefined && (cond.hour < 0 || cond.hour > 23)) {
      issues.push({ path: `${basePath}.hour`, message: '시간은 0–23 사이여야 합니다.' })
    }
    if (cond.minute !== undefined && (cond.minute < 0 || cond.minute > 59)) {
      issues.push({ path: `${basePath}.minute`, message: '분은 0–59 사이여야 합니다.' })
    }
  }

  return issues
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}


