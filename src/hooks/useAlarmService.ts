import { useEffect } from "react";
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
}
