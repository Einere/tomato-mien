import React from 'react';
import type { TimeCondition, CompoundCondition } from '../../types/alarm';
import { CompoundConditions, SingleCondition } from '.';
import {
  createDefaultRange,
  createDefaultCompound,
} from '../../utils/alarmRules';
import { isCompoundCondition, isTimeCondition } from '../../utils/typeGuards';
import { AddConditionDropdown } from './AddConditionDropdown';

type AnyCondition = TimeCondition | CompoundCondition;

interface NotionStyleConditionBuilderProps {
  condition: AnyCondition;
  onChange: (condition: AnyCondition) => void;
}

export const NotionStyleConditionBuilder: React.FC<
  NotionStyleConditionBuilderProps
> = ({ condition, onChange }) => {
  // 루트 레벨에서 조건을 추가하는 함수
  const addCondition = () => {
    if (isCompoundCondition(condition)) {
      // 이미 복합 조건이면 새 조건 추가
      onChange({
        ...condition,
        conditions: [...condition.conditions, createDefaultRange()],
      });
    } else {
      // 단일 조건이면 복합 조건으로 교체하고 새 조건 추가
      // 기존 단일 조건을 복합 조건의 첫 번째 조건으로 넣음
      onChange({
        operator: 'AND',
        conditions: [condition, createDefaultRange()],
      });
    }
  };

  const addGroup = () => {
    if (isCompoundCondition(condition)) {
      // 이미 복합 조건이면 새 그룹 추가
      onChange({
        ...condition,
        conditions: [...condition.conditions, createDefaultCompound('AND')],
      });
    } else {
      // 단일 조건이면 복합 조건으로 교체하고 새 그룹 추가
      // 기존 단일 조건을 복합 조건의 첫 번째 조건으로 넣음
      onChange({
        operator: 'AND',
        conditions: [condition, createDefaultCompound('AND')],
      });
    }
  };

  const handleDelete = () => {
    // 루트 조건은 삭제할 수 없으므로 기본값으로 리셋
    onChange(createDefaultRange());
  };

  const updateCondition = (updated: AnyCondition) => {
    onChange(updated);
  };

  return (
    <div className='space-y-4'>
      {isCompoundCondition(condition) ? (
        <CompoundConditions
          condition={condition}
          onChange={updateCondition}
          onDelete={handleDelete}
          showDelete={false}
        />
      ) : (
        <SingleCondition
          condition={condition}
          onChange={updateCondition}
          onDelete={handleDelete}
          showDelete={false}
        />
      )}

      {/* 루트 레벨 추가 버튼 - 단일 조건일 때만 표시 */}
      {isTimeCondition(condition) && (
        <AddConditionDropdown addCondition={addCondition} addGroup={addGroup} />
      )}
    </div>
  );
};
