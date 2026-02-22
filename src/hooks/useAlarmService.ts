import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { rulesAtom } from "@/store/atoms";
import { activateScheduledRulesAtom } from "@/store/actions";
import { WebWorkerAlarmService } from "@/services/WebWorkerAlarmService";

export function useAlarmService() {
  const activateScheduledRules = useSetAtom(activateScheduledRulesAtom);

  useEffect(() => {
    const service = WebWorkerAlarmService.getInstance();
    service.requestNotificationPermission();
    service.setScheduledEnableCallback(ruleIds =>
      activateScheduledRules(ruleIds),
    );
    service.start();

    return () => {
      service.stop();
    };
  }, [activateScheduledRules]);

  // 규칙 변경 시 Worker에 추가 알림 (Worker liveQuery와 중복되지만 debounce로 처리됨)
  // 초기 마운트 시에는 start()가 이미 스케줄링을 수행하므로 스킵
  const rules = useAtomValue(rulesAtom);
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    WebWorkerAlarmService.getInstance().notifyRulesChanged();
  }, [rules]);
}
