import type { AlarmRule } from '../types/alarm';
import { useAlarmDispatch } from './useAlarmDispatch';

export function useAlarmActions() {
  const dispatch = useAlarmDispatch();

  return {
    addRule: (rule: AlarmRule) => dispatch({ type: 'ADD_RULE', payload: rule }),
    updateRule: (rule: AlarmRule) =>
      dispatch({ type: 'UPDATE_RULE', payload: rule }),
    deleteRule: (id: string) => dispatch({ type: 'DELETE_RULE', payload: id }),
    toggleRule: (id: string) => {
      dispatch({ type: 'TOGGLE_RULE', payload: id });
    },
    selectRule: (id: string | undefined) =>
      dispatch({ type: 'SELECT_RULE', payload: id }),
  };
}
