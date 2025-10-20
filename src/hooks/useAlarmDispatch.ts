import { useContext } from 'react';
import { AlarmDispatchContext } from '@/contexts/AlarmContext';

export function useAlarmDispatch() {
  const context = useContext(AlarmDispatchContext);
  if (!context) {
    throw new Error('useAlarmDispatch must be used within an AlarmProvider');
  }
  return context.dispatch;
}
