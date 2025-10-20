import React, { createContext, useReducer } from 'react';
import type {
  AlarmRule,
  TimeCondition,
  CompoundCondition,
} from '@/types/alarm';

// Context 타입 정의
interface RuleEditorState {
  editedRule: AlarmRule | null;
  originalRule: AlarmRule | null;
  hasChanges: boolean;
}

interface RuleEditorDispatchContextType {
  dispatch: React.Dispatch<RuleEditorAction>;
}

// Action 타입 정의
type RuleEditorAction =
  | { type: 'SET_ORIGINAL_RULE'; payload: AlarmRule | null }
  | { type: 'INIT_EDIT'; payload: AlarmRule }
  | { type: 'UPDATE_NAME'; payload: string }
  | { type: 'UPDATE_ENABLED'; payload: boolean }
  | { type: 'UPDATE_CONDITION'; payload: TimeCondition | CompoundCondition }
  | { type: 'RESET_EDIT' }
  | { type: 'CLEAR_EDIT' };

// Context 생성
const RuleEditorContext = createContext<RuleEditorState | null>(null);
const RuleEditorDispatchContext =
  createContext<RuleEditorDispatchContextType | null>(null);

// 초기 상태
const initialState: RuleEditorState = {
  editedRule: null,
  originalRule: null,
  hasChanges: false,
};

// Reducer 함수
function ruleEditorReducer(
  state: RuleEditorState,
  action: RuleEditorAction,
): RuleEditorState {
  switch (action.type) {
    case 'SET_ORIGINAL_RULE': {
      const originalRule = action.payload;
      return {
        ...state,
        originalRule,
        editedRule: originalRule ? { ...originalRule } : null,
        hasChanges: false,
      };
    }
    case 'INIT_EDIT': {
      const originalRule = action.payload;
      return {
        ...state,
        originalRule,
        editedRule: { ...originalRule },
        hasChanges: false,
      };
    }
    case 'UPDATE_NAME': {
      if (!state.editedRule) return state;
      const updatedRule = { ...state.editedRule, name: action.payload };
      return {
        ...state,
        editedRule: updatedRule,
        hasChanges: hasChanges(updatedRule, state.originalRule),
      };
    }
    case 'UPDATE_ENABLED': {
      if (!state.editedRule) return state;
      const updatedRule = { ...state.editedRule, enabled: action.payload };
      return {
        ...state,
        editedRule: updatedRule,
        hasChanges: hasChanges(updatedRule, state.originalRule),
      };
    }
    case 'UPDATE_CONDITION': {
      if (!state.editedRule) return state;
      const updatedRule = {
        ...state.editedRule,
        condition: action.payload,
        updatedAt: new Date(),
      };
      return {
        ...state,
        editedRule: updatedRule,
        hasChanges: hasChanges(updatedRule, state.originalRule),
      };
    }
    case 'RESET_EDIT': {
      if (!state.originalRule) return state;
      return {
        ...state,
        editedRule: { ...state.originalRule },
        hasChanges: false,
      };
    }
    case 'CLEAR_EDIT': {
      return {
        ...state,
        editedRule: null,
        originalRule: null,
        hasChanges: false,
      };
    }
    default: {
      throw new Error(`Unknown action type: ${(action as any).type}`);
    }
  }
}

// 변경사항 확인 함수
function hasChanges(
  editedRule: AlarmRule | null,
  originalRule: AlarmRule | null,
): boolean {
  if (!editedRule || !originalRule) return false;

  return (
    editedRule.name !== originalRule.name ||
    editedRule.enabled !== originalRule.enabled ||
    JSON.stringify(editedRule.condition) !==
      JSON.stringify(originalRule.condition)
  );
}

// Provider 컴포넌트
export function RuleEditorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(ruleEditorReducer, initialState);

  return (
    <RuleEditorContext.Provider value={state}>
      <RuleEditorDispatchContext.Provider value={{ dispatch }}>
        {children}
      </RuleEditorDispatchContext.Provider>
    </RuleEditorContext.Provider>
  );
}

// Context들을 export하여 다른 파일에서 사용할 수 있도록 함
export { RuleEditorContext, RuleEditorDispatchContext };
