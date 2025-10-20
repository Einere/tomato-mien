import type {
  AlarmRule,
  TimeCondition,
  CompoundCondition,
} from '../types/alarm';
import { useRuleEditorDispatch } from './useRuleEditorDispatch';

export function useRuleEditorActions() {
  const dispatch = useRuleEditorDispatch();

  return {
    setOriginalRule: (rule: AlarmRule | null) =>
      dispatch({ type: 'SET_ORIGINAL_RULE', payload: rule }),
    initEdit: (rule: AlarmRule) =>
      dispatch({ type: 'INIT_EDIT', payload: rule }),
    updateName: (name: string) =>
      dispatch({ type: 'UPDATE_NAME', payload: name }),
    updateEnabled: (enabled: boolean) =>
      dispatch({ type: 'UPDATE_ENABLED', payload: enabled }),
    updateCondition: (condition: TimeCondition | CompoundCondition) =>
      dispatch({ type: 'UPDATE_CONDITION', payload: condition }),
    resetEdit: () => dispatch({ type: 'RESET_EDIT' }),
    clearEdit: () => dispatch({ type: 'CLEAR_EDIT' }),
  };
}
