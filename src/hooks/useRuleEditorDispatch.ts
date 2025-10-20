import { useContext } from 'react';
import { RuleEditorDispatchContext } from '@/contexts/RuleEditorContext';

export function useRuleEditorDispatch() {
  const context = useContext(RuleEditorDispatchContext);
  if (!context) {
    throw new Error(
      'useRuleEditorDispatch must be used within a RuleEditorProvider',
    );
  }
  return context.dispatch;
}
