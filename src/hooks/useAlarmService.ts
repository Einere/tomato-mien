import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { rulesAtom } from "@/store/atoms";
import { WebWorkerAlarmService } from "@/services/WebWorkerAlarmService";

export function useAlarmService() {
  useEffect(() => {
    const service = WebWorkerAlarmService.getInstance();
    service.requestNotificationPermission();
    service.start();

    return () => {
      service.stop();
    };
  }, []);

  // 규칙 변경 시 Worker에 추가 알림 (Worker liveQuery와 중복되지만 debounce로 처리됨)
  const rules = useAtomValue(rulesAtom);
  useEffect(() => {
    WebWorkerAlarmService.getInstance().notifyRulesChanged();
  }, [rules]);
}
