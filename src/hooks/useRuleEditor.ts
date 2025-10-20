import { useContext } from 'react';
import { RuleEditorContext } from '@/contexts/RuleEditorContext';

export function useRuleEditor() {
  const context = useContext(RuleEditorContext);
  if (!context) {
    throw new Error('useRuleEditor must be used within a RuleEditorProvider');
  }
  return context;
}
