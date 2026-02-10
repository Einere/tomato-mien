import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { rulesAtom } from '@/store';
import { WebWorkerAlarmService } from '@/services/WebWorkerAlarmService';

export function useAlarmService() {
  const rules = useAtomValue(rulesAtom);

  useEffect(() => {
    const service = WebWorkerAlarmService.getInstance();
    service.requestNotificationPermission();
    service.start();

    return () => {
      service.stop();
    };
  }, []);

  useEffect(() => {
    const service = WebWorkerAlarmService.getInstance();
    service.updateRules(rules);
  }, [rules]);
}
